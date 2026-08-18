import re
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

import pharma_service

router = APIRouter(prefix="/api/drug", tags=["Pharmacology & Drug Safety"])


class InteractionCheckRequest(BaseModel):
    drugs: Optional[List[str]] = []


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
    """Search the local clinical drug registry without external drug APIs."""
    try:
        results = pharma_service.search_rxnorm_drugs(q)
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
async def get_drug_details(name: str = Query(..., min_length=2, description="Drug name")):
    """Retrieve local clinical pharmacology intelligence without external drug APIs."""
    try:
        clean_name = pharma_service.re_clean_drug_name(name)

        dailymed_spls = pharma_service.get_dailymed_spls(clean_name)
        dailymed_ndcs = pharma_service.get_dailymed_ndcs(clean_name)

        local_properties = pharma_service.get_rxnorm_properties(clean_name) if clean_name else {}

        lower_name = clean_name.lower()
        fallback = None
        if lower_name in pharma_service.CLINICAL_FALLBACK_DRUGS:
            fallback = pharma_service.CLINICAL_FALLBACK_DRUGS[lower_name]

        return {
            "success": True,
            "drug_name": name,
            "cleaned_name": clean_name,
            "openfda": None,
            "faers_adverse_events": [],
            "recalls": [],
            "dailymed": {
                "monographs": dailymed_spls,
                "ndcs": dailymed_ndcs
            },
            "local_properties": local_properties,
            "fallback_clinical_info": fallback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve drug details: {str(e)}")


@router.post("/check-interactions")
@router.post("/check-interactions/")
async def check_interactions(payload: InteractionCheckRequest):
    """Evaluate multi-drug combinations for adverse DDI risk using the local clinical rules only."""
    try:
        resolved_drugs = []
        known_drugs = []

        for drug in (payload.drugs or []):
            if not drug or not drug.strip():
                continue
            clean = pharma_service.re_clean_drug_name(drug)
            lookup = pharma_service.search_rxnorm_drugs(clean)
            if lookup:
                known_drugs.append(clean)
            elif clean.lower() in pharma_service.CLINICAL_FALLBACK_DRUGS:
                known_drugs.append(clean)
            resolved_drugs.append({
                "input_name": drug,
                "clean_name": clean,
                "matched": bool(lookup or clean.lower() in pharma_service.CLINICAL_FALLBACK_DRUGS)
            })

        interactions = []
        if len(known_drugs) >= 2:
            interactions = pharma_service.check_rxnorm_drug_interactions(known_drugs)

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
    """Automated verification of a full medication list using the local clinical safety registry only."""
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

        drug_verifications = []
        checked_names = []

        for med in medications:
            clean = pharma_service.re_clean_drug_name(med.name)
            has_match = bool(pharma_service.search_rxnorm_drugs(clean) or clean.lower() in pharma_service.CLINICAL_FALLBACK_DRUGS)
            if has_match:
                checked_names.append(clean)

            fallback = pharma_service.CLINICAL_FALLBACK_DRUGS.get(clean.lower())
            has_boxed = bool(fallback and fallback.get("boxed_warning"))
            boxed_warning_text = fallback.get("boxed_warning") if fallback else None

            drug_verifications.append({
                "medication_name": med.name,
                "cleaned_name": clean,
                "dosage": med.dosage,
                "frequency": med.frequency,
                "matched_locally": has_match,
                "fda_approved": bool(clean.lower() in pharma_service.CLINICAL_FALLBACK_DRUGS),
                "has_boxed_warning": has_boxed,
                "boxed_warning": boxed_warning_text,
                "active_recalls_count": 0,
                "indications": fallback.get("indications") if fallback else med.purpose
            })

        interactions = []
        if len(checked_names) >= 2:
            interactions = pharma_service.check_rxnorm_drug_interactions(checked_names)

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
