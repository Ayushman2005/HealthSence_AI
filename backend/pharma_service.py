import json
import urllib.request
import urllib.parse
import urllib.error
import time
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("pharma_service")

# In-memory cache with TTL (1 hour)
_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 3600

def _get_from_cache(key: str) -> Optional[Any]:
    entry = _CACHE.get(key)
    if entry and (time.time() - entry["timestamp"] < CACHE_TTL_SECONDS):
        return entry["data"]
    return None

def _save_to_cache(key: str, data: Any):
    _CACHE[key] = {
        "timestamp": time.time(),
        "data": data
    }

def _fetch_json(url: str, timeout: int = 6) -> Optional[Dict[str, Any]]:
    """Safe HTTP GET returning parsed JSON with custom user-agent."""
    cached = _get_from_cache(url)
    if cached is not None:
        return cached

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "HealthSenceAI/2.6 (Clinical Risk AI & Pharmacology Engine; contact@healthrisk.ai)",
            "Accept": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                raw_data = response.read().decode('utf-8')
                parsed = json.loads(raw_data)
                _save_to_cache(url, parsed)
                return parsed
    except urllib.error.HTTPError as e:
        logger.warning(f"HTTPError fetching {url}: {e.code} - {e.reason}")
    except urllib.error.URLError as e:
        logger.warning(f"URLError fetching {url}: {e.reason}")
    except Exception as e:
        logger.warning(f"Exception fetching {url}: {str(e)}")
    return None


def _as_list(value: Any) -> List[Any]:
    """Normalize API payloads that sometimes return a single dict instead of a list."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _lookup_drug_record(query: str) -> Optional[Dict[str, Any]]:
    """Resolve a known medication against the local clinical registry by name or brand alias."""
    if not query:
        return None

    candidate = re_clean_drug_name(query).lower()
    if not candidate:
        return None

    for key, value in CLINICAL_FALLBACK_DRUGS.items():
        record_name = re_clean_drug_name(str(value.get("name") or key)).lower()
        aliases = {record_name, str(key).lower()}
        aliases.update(str(alias).lower() for alias in value.get("brand_names", []))
        alias_strings = {alias.replace("-", " ") for alias in aliases}
        if candidate in aliases or candidate.replace("-", " ") in alias_strings:
            return value
        if any(alias.startswith(candidate) or candidate.startswith(alias) for alias in aliases):
            return value
    return None


def _local_drug_matches(term: str) -> List[Dict[str, Any]]:
    """Resolve names against the project's local clinical drug registry without any external drug APIs."""
    if not term or len(term.strip()) < 2:
        return []

    cleaned = re_clean_drug_name(term).lower()
    if not cleaned:
        return []

    matches: List[Dict[str, Any]] = []
    seen = set()
    for key, value in CLINICAL_FALLBACK_DRUGS.items():
        entry_name = str(key).lower()
        brand_names = [str(brand).lower() for brand in value.get("brand_names", [])]
        aliases = {entry_name, str(value.get("name", "")).lower(), *brand_names}
        normalized_aliases = {alias.replace("-", " ") for alias in aliases}
        if cleaned in aliases or cleaned.replace("-", " ") in normalized_aliases:
            item = {
                "name": value.get("name") or key.title(),
                "source": "Local Clinical Registry",
                "class": value.get("class"),
                "brand_names": value.get("brand_names", [])
            }
            key_id = item["name"].lower()
            if key_id not in seen:
                matches.append(item)
                seen.add(key_id)

    if matches:
        return matches

    normalized = cleaned.replace("-", " ")
    for key, value in CLINICAL_FALLBACK_DRUGS.items():
        candidate = str(key).lower().replace("-", " ")
        if candidate.startswith(normalized) or normalized.startswith(candidate):
            item = {
                "name": value.get("name") or key.title(),
                "source": "Local Clinical Registry",
                "class": value.get("class"),
                "brand_names": value.get("brand_names", [])
            }
            key_id = item["name"].lower()
            if key_id not in seen:
                matches.append(item)
                seen.add(key_id)

    return matches


def search_rxnorm_drugs(term: str) -> List[Dict[str, Any]]:
    """Search the local clinical registry for known drug names without RxCUI or external calls."""
    return _local_drug_matches(term)


def get_rxnorm_properties(drug_name: str) -> Dict[str, Any]:
    """Return local clinical properties for a known drug name without any RxNorm identifier dependency."""
    if not drug_name:
        return {}

    record = _lookup_drug_record(drug_name)
    if record is None:
        return {}

    return {
        "NAME": record.get("name", ""),
        "CLASS": record.get("class", ""),
        "BRAND_NAMES": ", ".join(record.get("brand_names", [])),
        "INDICATIONS": record.get("indications", ""),
        "BOXED_WARNING": record.get("boxed_warning") or "",
        "CONTRAINDICATIONS": record.get("contraindications", "")
    }


def check_rxnorm_drug_interactions(drug_names: List[str]) -> List[Dict[str, Any]]:
    """Evaluate known clinical drug interactions using the local registry only."""
    if not drug_names or len(drug_names) < 2:
        return []

    KNOWN_DDI_RULES = [
        (("warfarin", "aspirin"), "High Risk / Severe", "high", "Concurrent anticoagulant and antiplatelet therapy significantly increases risk of major gastrointestinal and systemic bleeding."),
        (("warfarin", "ibuprofen"), "High Risk / Severe", "high", "NSAIDs inhibit platelet aggregation and cause gastric mucosal injury, dramatically increasing Warfarin hemorrhage risk."),
        (("lisinopril", "losartan"), "High Risk / Severe", "high", "Dual blockade of renin-angiotensin system (ACEI + ARB) produces severe hypotension, hyperkalemia, and acute renal failure with no added benefit."),
        (("lisinopril", "spironolactone"), "Moderate Clinical Precaution", "moderate", "Concomitant potassium-sparing diuretics and ACE inhibitors increase serum potassium; requires frequent renal/electrolyte monitoring."),
        (("atorvastatin", "clarithromycin"), "High Risk / Severe", "high", "Strong CYP3A4 inhibitors substantially increase Atorvastatin plasma concentrations, elevating risk of rhabdomyolysis."),
        (("metformin", "furosemide"), "Moderate Clinical Precaution", "moderate", "Furosemide increases Metformin blood levels while Metformin decreases Furosemide clearance.")
    ]

    normalized_tokens = set()
    for candidate in drug_names:
        if not candidate:
            continue
        text = str(candidate).strip()
        record = _lookup_drug_record(text)
        if record is not None:
            normalized_tokens.add(re_clean_drug_name(record.get("name") or text).lower())
            continue
        cleaned = re_clean_drug_name(text).lower()
        if cleaned:
            normalized_tokens.add(cleaned)

    interactions = []
    for pair_names, sev_label, sev_lvl, desc in KNOWN_DDI_RULES:
        if pair_names[0] in normalized_tokens and pair_names[1] in normalized_tokens:
            if not any(pair_names[0] in i.get("drug_a", "").lower() and pair_names[1] in i.get("drug_b", "").lower() for i in interactions):
                interactions.append({
                    "drug_a": pair_names[0].title(),
                    "drug_b": pair_names[1].title(),
                    "description": desc,
                    "severity": sev_label,
                    "severity_level": sev_lvl,
                    "source": "Local Clinical Guideline Reference"
                })

    return interactions


# ---------------------------------------------------------------------------
# 2. DailyMed REST API (National Library of Medicine - NLM)
# ---------------------------------------------------------------------------

def get_dailymed_spls(drug_name: str) -> List[Dict[str, Any]]:
    """Return local monograph metadata instead of calling a public drug API."""
    record = _lookup_drug_record(drug_name)
    if not record:
        return []

    return [{
        "setid": "local-reference",
        "title": _truncate_text(f"{record.get('name', 'Medication')} Local Clinical Monograph", 120),
        "published_date": "Local clinical reference",
        "dailymed_url": None
    }]


def get_dailymed_ndcs(drug_name: str) -> List[Dict[str, Any]]:
    """Return local package reference metadata instead of calling a third-party drug API."""
    record = _lookup_drug_record(drug_name)
    if not record:
        return []

    return [{
        "ndc": "Local reference",
        "package_description": "Clinical reference only; no external drug registry API is used.",
        "dosage_form": record.get("class", "Medication"),
        "route": "Clinical use per provider assessment"
    }]


# ---------------------------------------------------------------------------
# Utility & Fallback Pharmacology Helpers
# ---------------------------------------------------------------------------

def re_clean_drug_name(raw_name: str) -> str:
    """Strip dosage details, punctuation, and return core drug token."""
    if not raw_name:
        return ""
    import re
    # Remove dosage like '500mg', '10 mg', 'BID', 'QD'
    cleaned = re.sub(r'\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|meq|%)\b', '', raw_name, flags=re.IGNORECASE)
    cleaned = re.sub(r'\(.*?\)', '', cleaned)
    cleaned = re.sub(r'[^\w\s-]', '', cleaned)
    cleaned = cleaned.strip()
    words = cleaned.split()
    if words:
        return words[0]
    return raw_name.strip()


def _truncate_text(text: Optional[str], max_len: int = 300) -> Optional[str]:
    if not text:
        return None
    cleaned = " ".join(text.split())
    if len(cleaned) <= max_len:
        return cleaned
    return cleaned[:max_len] + "..."


CLINICAL_FALLBACK_DRUGS = {
    "metformin": {
        "name": "Metformin Hydrochloride",
        "class": "Biguanide / Antihyperglycemic Agent",
        "brand_names": ["Glucophage", "Fortamet", "Glumetza"],
        "indications": "First-line oral antidiabetic therapy for the management of Type 2 Diabetes Mellitus.",
        "boxed_warning": "Lactic Acidosis: Rare but serious metabolic complication characterized by elevated blood lactate levels.",
        "contraindications": "Severe renal impairment (eGFR < 30 mL/min/1.73 m2), metabolic acidosis including diabetic ketoacidosis.",
        "adverse_reactions": ["Diarrhea", "Nausea/Vomiting", "Flatulence", "Asthenia", "Abdominal discomfort"]
    },
    "lisinopril": {
        "name": "Lisinopril",
        "class": "Angiotensin-Converting Enzyme (ACE) Inhibitor",
        "brand_names": ["Prinivil", "Zestril", "Qbrelis"],
        "indications": "Treatment of hypertension, adjunct therapy in heart failure, and improvement of survival post-myocardial infarction.",
        "boxed_warning": "Fetal Toxicity: Discontinue as soon as pregnancy is detected; drugs that act on the renin-angiotensin system can cause fetal harm.",
        "contraindications": "History of angioedema related to previous ACE inhibitor treatment, co-administration with Aliskiren in diabetic patients.",
        "adverse_reactions": ["Persistent dry cough", "Dizziness", "Headache", "Hyperkalemia", "Hypotension"]
    },
    "atorvastatin": {
        "name": "Atorvastatin Calcium",
        "class": "HMG-CoA Reductase Inhibitor (Statin)",
        "brand_names": ["Lipitor"],
        "indications": "Reduction of elevated total cholesterol, LDL-C, Apo B, and triglycerides in primary hyperlipidemia and mixed dyslipidemia.",
        "boxed_warning": None,
        "contraindications": "Active liver disease, unexplained persistent elevations in hepatic transaminases, hypersensitivity.",
        "adverse_reactions": ["Myalgia", "Arthralgia", "Diarrhea", "Nasopharyngitis", "Dyspepsia"]
    }
}
