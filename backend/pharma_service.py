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


# ---------------------------------------------------------------------------
# 1. RxNorm REST API (National Library of Medicine - NLM)
# ---------------------------------------------------------------------------

def search_rxnorm_drugs(term: str) -> List[Dict[str, Any]]:
    """
    Search RxNorm for normalized drug names, spelling suggestions, and RxCUIs.
    API: https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=...
    """
    if not term or len(term.strip()) < 2:
        return []

    encoded_term = urllib.parse.quote(term.strip())
    url = f"https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term={encoded_term}&maxEntries=6"
    data = _fetch_json(url)

    results = []
    if data and "approximateGroup" in data:
        candidates = _as_list(data["approximateGroup"].get("candidate", []))
        for item in candidates:
            if not isinstance(item, dict):
                continue
            rxcui = item.get("rxcui")
            score = item.get("score")
            if rxcui:
                results.append({
                    "rxcui": str(rxcui),
                    "name": item.get("name") or term.title(),
                    "score": score,
                    "source": "RxNorm"
                })

    # Fallback to direct name search if approximate search didn't yield candidates
    if not results:
        direct_url = f"https://rxnav.nlm.nih.gov/REST/drugs.json?name={encoded_term}"
        direct_data = _fetch_json(direct_url)
        if direct_data and "drugGroup" in direct_data:
            concept_groups = _as_list(direct_data["drugGroup"].get("conceptGroup", []))
            for cg in concept_groups:
                if not isinstance(cg, dict):
                    continue
                for concept in _as_list(cg.get("conceptProperties", [])):
                    if not isinstance(concept, dict):
                        continue
                    results.append({
                        "rxcui": str(concept.get("rxcui")),
                        "name": concept.get("name"),
                        "synonym": concept.get("synonym"),
                        "tty": concept.get("tty"),
                        "source": "RxNorm"
                    })
                    if len(results) >= 6:
                        break

    return results


def get_rxnorm_properties(rxcui: str) -> Dict[str, Any]:
    """Fetch official properties & brand/generic relations for a specific RxCUI."""
    if not rxcui:
        return {}
    url = f"https://rxnav.nlm.nih.gov/REST/rxcui/{rxcui}/allProperties.json?prop=all"
    data = _fetch_json(url)
    properties = {}
    if data and "propConceptGroup" in data:
        prop_list = _as_list(data["propConceptGroup"].get("propConcept", []))
        for p in prop_list:
            if not isinstance(p, dict):
                continue
            properties[p.get("propName", "")] = p.get("propValue", "")
    return properties


def check_rxnorm_drug_interactions(rxcuis: List[str]) -> List[Dict[str, Any]]:
    """
    Check pairwise Drug-to-Drug Interactions (DDI) via RxNav Interaction API.
    API: https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=...
    """
    if not rxcuis or len(rxcuis) < 2:
        return []

    rxcui_str = "+".join(rxcuis)
    url = f"https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis={rxcui_str}"
    data = _fetch_json(url)

    interactions = []
    if data and "fullInteractionTypeGroup" in data:
        for group in data["fullInteractionTypeGroup"]:
            source_name = group.get("sourceName", "NLM RxNav")
            for itype in group.get("fullInteractionType", []):
                comment = itype.get("comment", "")
                min_concepts = itype.get("minConcept", [])
                
                drug_a = min_concepts[0].get("name", "Drug A") if len(min_concepts) > 0 else "Drug A"
                drug_b = min_concepts[1].get("name", "Drug B") if len(min_concepts) > 1 else "Drug B"
                rxcui_a = min_concepts[0].get("rxcui", "") if len(min_concepts) > 0 else ""
                rxcui_b = min_concepts[1].get("rxcui", "") if len(min_concepts) > 1 else ""

                for ipair in itype.get("interactionPair", []):
                    desc = ipair.get("description", comment or "Clinical drug interaction detected.")
                    severity = ipair.get("severity", "N/A")
                    
                    # Deduce severity level if N/A
                    desc_lower = desc.lower()
                    if any(w in desc_lower for w in ["fatal", "severe", "contraindicated", "avoid combination", "toxicity", "life-threatening"]):
                        normalized_severity = "High Risk / Severe"
                        severity_level = "high"
                    elif any(w in desc_lower for w in ["moderate", "monitor", "caution", "dosage adjustment", "increase", "decrease"]):
                        normalized_severity = "Moderate Clinical Precaution"
                        severity_level = "moderate"
                    else:
                        normalized_severity = "Minor / Informational"
                        severity_level = "low"

                    interactions.append({
                        "drug_a": drug_a,
                        "drug_b": drug_b,
                        "rxcui_a": rxcui_a,
                        "rxcui_b": rxcui_b,
                        "description": desc,
                        "severity": normalized_severity,
                        "severity_level": severity_level,
                        "source": source_name
                    })

    # If NLM list didn't yield full pairs, enrich with clinical high-priority DDI dictionary
    for cui in rxcuis:
        if len(interactions) >= 5:
            break
        # Query individual interaction if needed
        indiv_url = f"https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui={cui}&sources=ONCHigh"
        indiv_data = _fetch_json(indiv_url)
        if indiv_data and "interactionTypeGroup" in indiv_data:
            for itg in indiv_data["interactionTypeGroup"]:
                for it in itg.get("interactionType", []):
                    for ip in it.get("interactionPair", []):
                        concepts = ip.get("interactionConcept", [])
                        if len(concepts) >= 2:
                            c1 = concepts[0].get("minConceptItem", {}).get("name", "")
                            c2 = concepts[1].get("minConceptItem", {}).get("name", "")
                            desc = ip.get("description", "")
                            # Check if the other interacting drug is in our requested rxcuis
                            c2_rxcui = concepts[1].get("minConceptItem", {}).get("rxcui", "")
                            if c2_rxcui in rxcuis and not any(i["rxcui_a"] == cui and i["rxcui_b"] == c2_rxcui for i in interactions):
                                interactions.append({
                                    "drug_a": c1,
                                    "drug_b": c2,
                                    "rxcui_a": cui,
                                    "rxcui_b": c2_rxcui,
                                    "description": desc,
                                    "severity": "High Risk / Severe" if "severe" in desc.lower() else "Moderate Clinical Precaution",
                                    "severity_level": "high" if "severe" in desc.lower() else "moderate",
                                    "source": "NLM ONCHigh"
                                })

    # High-Priority Clinical Rules Fallback
    RXCUI_MAP = {
        "11289": "warfarin",
        "1191": "aspirin",
        "5640": "ibuprofen",
        "29046": "lisinopril",
        "5224": "losartan",
        "9997": "spironolactone",
        "6809": "metformin",
        "83367": "atorvastatin",
        "21212": "clarithromycin",
        "4603": "furosemide"
    }

    KNOWN_DDI_RULES = [
        (("warfarin", "aspirin"), "High Risk / Severe", "high", "Concurrent anticoagulant and antiplatelet therapy significantly increases risk of major gastrointestinal and systemic bleeding."),
        (("warfarin", "ibuprofen"), "High Risk / Severe", "high", "NSAIDs inhibit platelet aggregation and cause gastric mucosal injury, dramatically increasing Warfarin hemorrhage risk."),
        (("lisinopril", "losartan"), "High Risk / Severe", "high", "Dual blockade of renin-angiotensin system (ACEI + ARB) produces severe hypotension, hyperkalemia, and acute renal failure with no added benefit."),
        (("lisinopril", "spironolactone"), "Moderate Clinical Precaution", "moderate", "Concomitant potassium-sparing diuretics and ACE inhibitors increase serum potassium; requires frequent renal/electrolyte monitoring."),
        (("atorvastatin", "clarithromycin"), "High Risk / Severe", "high", "Strong CYP3A4 inhibitors substantially increase Atorvastatin plasma concentrations, elevating risk of rhabdomyolysis."),
        (("metformin", "furosemide"), "Moderate Clinical Precaution", "moderate", "Furosemide increases Metformin blood levels while Metformin decreases Furosemide clearance.")
    ]

    # Convert rxcuis / names to normalized tokens
    normalized_tokens = set()
    for r in rxcuis:
        r_str = str(r).strip()
        normalized_tokens.add(r_str.lower())
        if r_str in RXCUI_MAP:
            normalized_tokens.add(RXCUI_MAP[r_str])
        clean = re_clean_drug_name(r_str).lower()
        if clean:
            normalized_tokens.add(clean)

    for pair_names, sev_label, sev_lvl, desc in KNOWN_DDI_RULES:
        if pair_names[0] in normalized_tokens and pair_names[1] in normalized_tokens:
            if not any(pair_names[0] in i.get("drug_a", "").lower() and pair_names[1] in i.get("drug_b", "").lower() for i in interactions):
                interactions.append({
                    "drug_a": pair_names[0].title(),
                    "drug_b": pair_names[1].title(),
                    "rxcui_a": CLINICAL_FALLBACK_DRUGS.get(pair_names[0], {}).get("rxcui", ""),
                    "rxcui_b": CLINICAL_FALLBACK_DRUGS.get(pair_names[1], {}).get("rxcui", ""),
                    "description": desc,
                    "severity": sev_label,
                    "severity_level": sev_lvl,
                    "source": "FDA & NLM Clinical Guideline Reference"
                })

    return interactions


# ---------------------------------------------------------------------------
# 2. OpenFDA Drug APIs (Food and Drug Administration)
# ---------------------------------------------------------------------------

def get_openfda_drug_label(drug_name: str) -> Optional[Dict[str, Any]]:
    """
    Query OpenFDA Drug Product Labeling API for indications, warnings, boxed warnings & dosage.
    API: https://api.fda.gov/drug/label.json?search=openfda.brand_name:...
    """
    clean_name = re_clean_drug_name(drug_name)
    if not clean_name:
        return None

    encoded = urllib.parse.quote(f'openfda.brand_name:"{clean_name}"+openfda.generic_name:"{clean_name}"')
    url = f"https://api.fda.gov/drug/label.json?search={encoded}&limit=1"
    data = _fetch_json(url)

    if not data or "results" not in data or not data["results"]:
        # Fallback to broader search
        fallback_encoded = urllib.parse.quote(f'"{clean_name}"')
        fallback_url = f"https://api.fda.gov/drug/label.json?search={fallback_encoded}&limit=1"
        data = _fetch_json(fallback_url)

    if data and "results" in data and data["results"]:
        item = data["results"][0]
        openfda_obj = item.get("openfda", {})
        
        # Extract key clinical sections
        brand_names = openfda_obj.get("brand_name", [clean_name.title()])
        generic_names = openfda_obj.get("generic_name", [clean_name.title()])
        substances = openfda_obj.get("substance_name", [])
        product_types = openfda_obj.get("product_type", ["HUMAN PRESCRIPTION DRUG"])
        route = openfda_obj.get("route", ["ORAL"])
        
        # Clinical text fields
        boxed_warning = item.get("boxed_warning", [""])[0] if item.get("boxed_warning") else None
        indications = item.get("indications_and_usage", [""])[0] if item.get("indications_and_usage") else None
        contraindications = item.get("contraindications", [""])[0] if item.get("contraindications") else None
        warnings = item.get("warnings", [""])[0] if item.get("warnings") else item.get("warnings_and_cautions", [""])[0] if item.get("warnings_and_cautions") else None
        dosage = item.get("dosage_and_administration", [""])[0] if item.get("dosage_and_administration") else None
        adverse_reactions = item.get("adverse_reactions", [""])[0] if item.get("adverse_reactions") else None
        drug_interactions_txt = item.get("drug_interactions", [""])[0] if item.get("drug_interactions") else None

        return {
            "brand_names": brand_names,
            "generic_names": generic_names,
            "substance_names": substances,
            "product_type": product_types[0] if product_types else "HUMAN PRESCRIPTION DRUG",
            "route": route[0] if route else "ORAL",
            "has_boxed_warning": bool(boxed_warning),
            "boxed_warning": _truncate_text(boxed_warning, 400),
            "indications_and_usage": _truncate_text(indications, 500),
            "contraindications": _truncate_text(contraindications, 400),
            "warnings_and_precautions": _truncate_text(warnings, 400),
            "dosage_and_administration": _truncate_text(dosage, 350),
            "adverse_reactions": _truncate_text(adverse_reactions, 400),
            "drug_interactions": _truncate_text(drug_interactions_txt, 400),
            "spl_id": openfda_obj.get("spl_id", [""])[0] if openfda_obj.get("spl_id") else None,
            "package_ndc": openfda_obj.get("package_ndc", [])[:4],
            "pharm_class": openfda_obj.get("pharm_class_epc", [])
        }

    return None


def get_openfda_adverse_events(drug_name: str) -> List[Dict[str, Any]]:
    """
    Query OpenFDA FAERS (FDA Adverse Event Reporting System) to get top reported adverse events and counts.
    API: https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:...&count=...
    """
    clean_name = re_clean_drug_name(drug_name)
    if not clean_name:
        return []

    encoded = urllib.parse.quote(f'"{clean_name}"')
    url = f"https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:{encoded}&count=patient.reaction.reactionmeddrapt.exact&limit=8"
    data = _fetch_json(url)

    adverse_events = []
    if data and "results" in data:
        for r in data["results"][:8]:
            term = r.get("term", "").title()
            count = r.get("count", 0)
            if term:
                adverse_events.append({
                    "reaction": term,
                    "report_count": count
                })

    return adverse_events


def get_openfda_recalls(drug_name: str) -> List[Dict[str, Any]]:
    """
    Query OpenFDA Enforcement reports for drug recalls.
    API: https://api.fda.gov/drug/enforcement.json?search=product_description:...
    """
    clean_name = re_clean_drug_name(drug_name)
    if not clean_name:
        return []

    encoded = urllib.parse.quote(f'product_description:"{clean_name}"')
    url = f"https://api.fda.gov/drug/enforcement.json?search={encoded}&limit=3"
    data = _fetch_json(url)

    recalls = []
    if data and "results" in data:
        for r in data["results"][:3]:
            recalls.append({
                "recall_number": r.get("recall_number"),
                "reason_for_recall": _truncate_text(r.get("reason_for_recall"), 200),
                "classification": r.get("classification"),
                "status": r.get("status"),
                "distribution_pattern": _truncate_text(r.get("distribution_pattern"), 100),
                "recall_initiation_date": r.get("recall_initiation_date")
            })

    return recalls


# ---------------------------------------------------------------------------
# 3. DailyMed REST API (National Library of Medicine - NLM)
# ---------------------------------------------------------------------------

def get_dailymed_spls(drug_name: str) -> List[Dict[str, Any]]:
    """
    Fetch DailyMed Structured Product Label (SPL) entries and official monograph URLs.
    API: https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=...
    """
    clean_name = re_clean_drug_name(drug_name)
    if not clean_name:
        return []

    encoded = urllib.parse.quote(clean_name)
    url = f"https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name={encoded}&page=1&pagesize=4"
    data = _fetch_json(url)

    spl_list = []
    if data and "data" in data:
        for item in data["data"]:
            setid = item.get("setid")
            title = item.get("title", f"{drug_name.title()} Monograph")
            published_date = item.get("published_date")
            spl_list.append({
                "setid": setid,
                "title": _truncate_text(title, 120),
                "published_date": published_date,
                "dailymed_url": f"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid={setid}" if setid else None
            })

    return spl_list


def get_dailymed_ndcs(drug_name: str) -> List[Dict[str, Any]]:
    """
    Fetch DailyMed National Drug Codes (NDCs) and packaging specifications.
    API: https://dailymed.nlm.nih.gov/dailymed/services/v2/ndcs.json?drug_name=...
    """
    clean_name = re_clean_drug_name(drug_name)
    if not clean_name:
        return []

    encoded = urllib.parse.quote(clean_name)
    url = f"https://dailymed.nlm.nih.gov/dailymed/services/v2/ndcs.json?drug_name={encoded}&page=1&pagesize=5"
    data = _fetch_json(url)

    ndc_list = []
    if data and "data" in data:
        for item in data["data"]:
            ndc_list.append({
                "ndc": item.get("ndc"),
                "package_description": item.get("package_description"),
                "dosage_form": item.get("dosage_form"),
                "route": item.get("route")
            })

    return ndc_list


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
        "rxcui": "6809",
        "name": "Metformin Hydrochloride",
        "class": "Biguanide / Antihyperglycemic Agent",
        "brand_names": ["Glucophage", "Fortamet", "Glumetza"],
        "indications": "First-line oral antidiabetic therapy for the management of Type 2 Diabetes Mellitus.",
        "boxed_warning": "Lactic Acidosis: Rare but serious metabolic complication characterized by elevated blood lactate levels.",
        "contraindications": "Severe renal impairment (eGFR < 30 mL/min/1.73 m2), metabolic acidosis including diabetic ketoacidosis.",
        "adverse_reactions": ["Diarrhea", "Nausea/Vomiting", "Flatulence", "Asthenia", "Abdominal discomfort"]
    },
    "lisinopril": {
        "rxcui": "29046",
        "name": "Lisinopril",
        "class": "Angiotensin-Converting Enzyme (ACE) Inhibitor",
        "brand_names": ["Prinivil", "Zestril", "Qbrelis"],
        "indications": "Treatment of hypertension, adjunct therapy in heart failure, and improvement of survival post-myocardial infarction.",
        "boxed_warning": "Fetal Toxicity: Discontinue as soon as pregnancy is detected; drugs that act on the renin-angiotensin system can cause fetal harm.",
        "contraindications": "History of angioedema related to previous ACE inhibitor treatment, co-administration with Aliskiren in diabetic patients.",
        "adverse_reactions": ["Persistent dry cough", "Dizziness", "Headache", "Hyperkalemia", "Hypotension"]
    },
    "atorvastatin": {
        "rxcui": "83367",
        "name": "Atorvastatin Calcium",
        "class": "HMG-CoA Reductase Inhibitor (Statin)",
        "brand_names": ["Lipitor"],
        "indications": "Reduction of elevated total cholesterol, LDL-C, Apo B, and triglycerides in primary hyperlipidemia and mixed dyslipidemia.",
        "boxed_warning": None,
        "contraindications": "Active liver disease, unexplained persistent elevations in hepatic transaminases, hypersensitivity.",
        "adverse_reactions": ["Myalgia", "Arthralgia", "Diarrhea", "Nasopharyngitis", "Dyspepsia"]
    }
}
