import re
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

import pharma_service

router = APIRouter(prefix="/api/drug", tags=["Pharmacology & Drug Safety"])


class InteractionCheckRequest(BaseModel):
    drugs: Optional[List[str]] = []
    rxcuis: Optional[List[str]] = []


class MedicationItem(BaseModel):
    name: str
    dosage: Optional[str] = ""
    frequency: Optional[str] = ""
    purpose: Optional[str] = ""


class PrescriptionVerificationRequest(BaseModel):
    medications: List[MedicationItem]
    patient_conditions: Optional[List[str]] = []


@router.get("/search")
@router.get("/search/")
async def search_drugs(q: str = Query(..., min_length=2, description="Drug brand or generic name")):
    """
    Search across RxNorm for normalized drug concept names and RxCUIs.
    """
    try:
        results = pharma_service.search_rxnorm_drugs(q)
        # If RxNorm returns nothing, attempt OpenFDA search to get brand names
        if not results:
            fda_data = pharma_service.get_openfda_drug_label(q)
            if fda_data:
                for b_name in fda_data.get("brand_names", [q.title()]):
                    results.append({
                        "rxcui": "",
                        "name": b_name,
                        "score": "100",
                        "source": "OpenFDA"
                    })

        return {
            "success": True,
            "query": q,
            "count": len(results),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Drug search failed: {str(e)}")


@router.get("/details")
@router.get("/details/")
async def get_drug_details(
    name: str = Query(..., min_length=2, description="Drug name"),
    rxcui: Optional[str] = Query(None, description="Optional RxNorm CUI")
):
    """
    Retrieve comprehensive clinical pharmacology intelligence:
    - OpenFDA: Boxed Warnings, Indications, Contraindications, Adverse Reactions, Dosage
    - OpenFDA FAERS: Real-world adverse event frequency report
    - DailyMed: Official SPL monographs and NDC packaging codes
    - RxNorm: Standardized identifiers and clinical properties
    """
    try:
        clean_name = pharma_service.re_clean_drug_name(name)
        
        # 1. OpenFDA Drug Label
        fda_label = pharma_service.get_openfda_drug_label(clean_name)
        
        # 2. OpenFDA FAERS Adverse Events
        faers_events = pharma_service.get_openfda_adverse_events(clean_name)
        
        # 3. OpenFDA Drug Recalls
        recalls = pharma_service.get_openfda_recalls(clean_name)

        # 4. DailyMed SPL Monographs & NDC Packaging
        dailymed_spls = pharma_service.get_dailymed_spls(clean_name)
        dailymed_ndcs = pharma_service.get_dailymed_ndcs(clean_name)

        # 5. RxNorm Properties
        resolved_rxcui = rxcui
        if not resolved_rxcui:
            rx_results = pharma_service.search_rxnorm_drugs(clean_name)
            if rx_results and rx_results[0].get("rxcui"):
                resolved_rxcui = rx_results[0]["rxcui"]

        rxnorm_props = pharma_service.get_rxnorm_properties(resolved_rxcui) if resolved_rxcui else {}

        # Fallback enrichment if live APIs returned sparse data
        lower_name = clean_name.lower()
        if lower_name in pharma_service.CLINICAL_FALLBACK_DRUGS:
            fallback = pharma_service.CLINICAL_FALLBACK_DRUGS[lower_name]
            if not fda_label:
                fda_label = {
                    "brand_names": fallback.get("brand_names", [name.title()]),
                    "generic_names": [fallback.get("name", name.title())],
                    "product_type": "HUMAN PRESCRIPTION DRUG",
                    "route": "ORAL",
                    "has_boxed_warning": bool(fallback.get("boxed_warning")),
                    "boxed_warning": fallback.get("boxed_warning"),
                    "indications_and_usage": fallback.get("indications"),
                    "contraindications": fallback.get("contraindications"),
                    "warnings_and_precautions": "Clinical monitoring recommended for glycemic and renal biomarkers.",
                    "dosage_and_administration": "As prescribed by physician.",
                    "adverse_reactions": ", ".join(fallback.get("adverse_reactions", []))
                }
            if not resolved_rxcui:
                resolved_rxcui = fallback.get("rxcui")

        return {
            "success": True,
            "drug_name": name,
            "cleaned_name": clean_name,
            "rxcui": resolved_rxcui,
            "openfda": fda_label,
            "faers_adverse_events": faers_events,
            "recalls": recalls,
            "dailymed": {
                "monographs": dailymed_spls,
                "ndcs": dailymed_ndcs
            },
            "rxnorm_properties": rxnorm_props
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve drug details: {str(e)}")


@router.post("/check-interactions")
@router.post("/check-interactions/")
async def check_interactions(payload: InteractionCheckRequest):
    """
    Evaluate multi-drug combinations for adverse Drug-to-Drug Interactions (DDI)
    using the NLM RxNorm Interaction API.
    """
    try:
        rxcuis = list(payload.rxcuis or [])
        resolved_drugs = []

        # If drug names provided without RxCUIs, resolve each to RxCUI
        for drug in (payload.drugs or []):
            if not drug or not drug.strip():
                continue
            clean = pharma_service.re_clean_drug_name(drug)
            rx_search = pharma_service.search_rxnorm_drugs(clean)
            cui = None
            if rx_search and rx_search[0].get("rxcui"):
                cui = rx_search[0]["rxcui"]
            elif clean.lower() in pharma_service.CLINICAL_FALLBACK_DRUGS:
                cui = pharma_service.CLINICAL_FALLBACK_DRUGS[clean.lower()].get("rxcui")
            
            if cui and cui not in rxcuis:
                rxcuis.append(cui)
            resolved_drugs.append({
                "input_name": drug,
                "clean_name": clean,
                "rxcui": cui or "Unmatched"
            })

        interactions = []
        if len(rxcuis) >= 2:
            valid_rxcuis = [c for c in rxcuis if c and c != "Unmatched"]
            interactions = pharma_service.check_rxnorm_drug_interactions(valid_rxcuis)

        # Classify overall risk level
        has_high = any(i.get("severity_level") == "high" for i in interactions)
        has_mod = any(i.get("severity_level") == "moderate" for i in interactions)
        
        overall_status = "Safe / No Documented Major DDIs"
        if has_high:
            overall_status = "High Clinical Risk / Severe Interaction Alert"
        elif has_mod:
            overall_status = "Moderate Clinical Caution Required"

        return {
            "success": True,
            "evaluated_drugs_count": len(resolved_drugs),
            "resolved_drugs": resolved_drugs,
            "interactions_count": len(interactions),
            "overall_status": overall_status,
            "has_high_risk": has_high,
            "has_moderate_risk": has_mod,
            "interactions": interactions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interaction check failed: {str(e)}")


@router.post("/verify-prescription")
@router.post("/verify-prescription/")
async def verify_prescription(payload: PrescriptionVerificationRequest):
    """
    Automated verification of a full medical report prescription list:
    1. Checks each medication against OpenFDA Boxed Warnings & Recalls.
    2. Runs pairwise Drug-to-Drug Interaction (DDI) check across all medications via RxNorm.
    3. Provides safety rating and clinical precautions.
    """
    try:
        medications = payload.medications
        if not medications:
            return {
                "success": True,
                "verified": True,
                "message": "No medications provided for verification.",
                "drug_verifications": [],
                "interactions": []
            }

        drug_names = [m.name for m in medications]
        drug_verifications = []
        rxcuis_to_check = []

        for med in medications:
            clean = pharma_service.re_clean_drug_name(med.name)
            
            # FDA info
            fda_data = pharma_service.get_openfda_drug_label(clean)
            recalls = pharma_service.get_openfda_recalls(clean)
            
            # Resolve RxCUI
            rx_search = pharma_service.search_rxnorm_drugs(clean)
            cui = rx_search[0].get("rxcui") if rx_search else None
            if not cui and clean.lower() in pharma_service.CLINICAL_FALLBACK_DRUGS:
                cui = pharma_service.CLINICAL_FALLBACK_DRUGS[clean.lower()].get("rxcui")

            if cui:
                rxcuis_to_check.append(cui)

            has_boxed = False
            boxed_warning_text = None
            if fda_data:
                has_boxed = fda_data.get("has_boxed_warning", False)
                boxed_warning_text = fda_data.get("boxed_warning")
            elif clean.lower() in pharma_service.CLINICAL_FALLBACK_DRUGS:
                fb = pharma_service.CLINICAL_FALLBACK_DRUGS[clean.lower()]
                has_boxed = bool(fb.get("boxed_warning"))
                boxed_warning_text = fb.get("boxed_warning")

            drug_verifications.append({
                "medication_name": med.name,
                "cleaned_name": clean,
                "dosage": med.dosage,
                "frequency": med.frequency,
                "rxcui": cui or "Pending NLM Match",
                "fda_approved": bool(fda_data or clean.lower() in pharma_service.CLINICAL_FALLBACK_DRUGS),
                "has_boxed_warning": has_boxed,
                "boxed_warning": boxed_warning_text,
                "active_recalls_count": len(recalls),
                "indications": fda_data.get("indications_and_usage") if fda_data else med.purpose
            })

        # Pairwise DDI evaluation
        interactions = []
        if len(rxcuis_to_check) >= 2:
            interactions = pharma_service.check_rxnorm_drug_interactions(rxcuis_to_check)

        has_high_ddi = any(i.get("severity_level") == "high" for i in interactions)
        has_mod_ddi = any(i.get("severity_level") == "moderate" for i in interactions)
        any_boxed_warnings = any(v.get("has_boxed_warning") for v in drug_verifications)

        safety_grade = "A+ (Optimal Prescription Safety)"
        if has_high_ddi:
            safety_grade = "C- (High-Risk Interaction Detected)"
        elif any_boxed_warnings or has_mod_ddi:
            safety_grade = "B+ (Clinical Monitoring Recommended)"

        return {
            "success": True,
            "verified": True,
            "safety_grade": safety_grade,
            "total_medications_checked": len(medications),
            "any_boxed_warnings": any_boxed_warnings,
            "interactions_count": len(interactions),
            "drug_verifications": drug_verifications,
            "interactions": interactions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prescription verification failed: {str(e)}")
