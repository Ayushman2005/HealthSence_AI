import os
import json
import logging
import asyncio
import math
from datetime import datetime
import numpy as np
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Request, HTTPException, Depends, Header
from pydantic import BaseModel, Field

from config import BASE_DIR, MODELS_DIR
from auth import (
    get_auth_token, get_admin_token, extract_username_from_auth,
    extract_role_from_auth, is_admin_user
)
from database import db_execute, db_fetchall, db_fetchone, log_audit_event
import ml_engine
import secrets

logger = logging.getLogger("predict_routes")
router = APIRouter()

class PersonalData(BaseModel):
    name: Optional[str] = 'Anonymous'
    age: int = Field(35, ge=1, le=120)
    gender: str = Field('male')
    height: float = Field(170.0, gt=0, le=300)
    weight: float = Field(70.0, gt=0, le=500)
    bmi: Optional[float] = None
    race: Optional[str] = 'white_other'

class LifestyleData(BaseModel):
    smoking: str = Field('no')
    alcohol: str = Field('low')
    physicalActivity: str = Field('moderate')
    sleepDuration: float = Field(7.0, ge=0, le=24)

class MedicalData(BaseModel):
    bpSystolic: int = Field(120, ge=50, le=300)
    bpDiastolic: int = Field(80, ge=30, le=200)
    cholesterol: int = Field(180, ge=50, le=600)
    glucose: int = Field(90, ge=30, le=600)
    insulin: int = Field(8, ge=0, le=300)
    heartRate: int = Field(70, ge=30, le=250)
    hdl: Optional[int] = Field(None, ge=10, le=150)
    ldl: Optional[int] = Field(None, ge=20, le=400)
    hba1c: Optional[float] = Field(None, ge=3.0, le=20.0)
    bpTreated: Optional[bool] = False
    priorStroke: Optional[bool] = False
    priorHF: Optional[bool] = False

class PredictRequest(BaseModel):
    name: Optional[str] = None
    personal: Optional[PersonalData] = None
    lifestyle: Optional[LifestyleData] = None
    medical: Optional[MedicalData] = None
    algorithm: Optional[str] = 'auto'
    # Optional flat fields for backward compatibility
    age: Optional[int] = Field(None, ge=1, le=120)
    height: Optional[float] = Field(None, gt=0, le=300)
    weight: Optional[float] = Field(None, gt=0, le=500)
    gender: Optional[str] = None
    smoking: Optional[str] = None
    alcohol: Optional[str] = None
    physicalActivity: Optional[str] = None
    sleepDuration: Optional[float] = Field(None, ge=0, le=24)
    bpSystolic: Optional[int] = Field(None, ge=50, le=300)
    bpDiastolic: Optional[int] = Field(None, ge=30, le=200)
    cholesterol: Optional[int] = Field(None, ge=50, le=600)
    glucose: Optional[int] = Field(None, ge=30, le=600)
    insulin: Optional[int] = Field(None, ge=0, le=300)
    heartRate: Optional[int] = Field(None, ge=30, le=250)
    hdl: Optional[int] = Field(None, ge=10, le=150)
    ldl: Optional[int] = Field(None, ge=20, le=400)
    hba1c: Optional[float] = Field(None, ge=3.0, le=20.0)
    bpTreated: Optional[bool] = None
    priorStroke: Optional[bool] = None
    priorHF: Optional[bool] = None
    race: Optional[str] = None

def compute_ascvd_pce(
    age: int,
    gender: str,
    total_chol: int,
    sbp: int,
    hdl: Optional[int] = None,
    bp_treated: bool = False,
    smoking: str = 'no',
    diabetes_risk: float = 0,
    glucose: int = 90,
    race: str = 'white_other'
) -> Dict[str, Any]:
    """
    Computes 10-Year ASCVD Risk using the ACC/AHA 2013/2018 Pooled Cohort Equations (PCE).
    Estimates 10-year risk of hard ASCVD (coronary death, nonfatal myocardial infarction, stroke).
    """
    is_male = str(gender).strip().lower() == 'male'
    if hdl is None or hdl <= 0:
        hdl = 45 if is_male else 50

    clamped_age = max(20, min(79, age))
    clamped_tc = max(130, min(320, total_chol))
    clamped_hdl = max(20, min(100, hdl))
    clamped_sbp = max(90, min(200, sbp))

    ln_age = math.log(clamped_age)
    ln_tc = math.log(clamped_tc)
    ln_hdl = math.log(clamped_hdl)
    ln_sbp = math.log(clamped_sbp)

    is_smoker = str(smoking).strip().lower() == 'yes'
    has_diabetes = (glucose >= 126) or (diabetes_risk >= 50)
    is_black = 'african' in str(race).lower() or 'black' in str(race).lower()

    if not is_black:
        if is_male:
            coeff = (12.344 * ln_age) + (11.853 * ln_tc) - (2.664 * ln_age * ln_tc) - (7.990 * ln_hdl) + (1.769 * ln_age * ln_hdl)
            coeff += (1.797 * ln_sbp) if bp_treated else (1.764 * ln_sbp)
            coeff += (7.837 - 1.795 * ln_age) if is_smoker else 0.0
            coeff += 0.658 if has_diabetes else 0.0
            mean_sum = 61.18
            base_surv = 0.9144
        else:
            coeff = (-29.799 * ln_age) + (4.884 * (ln_age ** 2)) + (13.540 * ln_tc) - (3.114 * ln_age * ln_tc) - (13.578 * ln_hdl) + (3.149 * ln_age * ln_hdl)
            coeff += (2.019 * ln_sbp) if bp_treated else (1.957 * ln_sbp)
            coeff += (7.574 - 1.665 * ln_age) if is_smoker else 0.0
            coeff += 0.661 if has_diabetes else 0.0
            mean_sum = -29.18
            base_surv = 0.9665
    else:
        if is_male:
            coeff = (2.469 * ln_age) + (0.302 * ln_tc) - (0.307 * ln_hdl)
            coeff += (1.916 * ln_sbp) if bp_treated else (1.809 * ln_sbp)
            coeff += 0.549 if is_smoker else 0.0
            coeff += 0.645 if has_diabetes else 0.0
            mean_sum = 19.54
            base_surv = 0.8954
        else:
            coeff = (17.114 * ln_age) + (0.940 * ln_tc) - (18.920 * ln_hdl) + (4.475 * ln_age * ln_hdl)
            coeff += (29.291 * ln_sbp - 6.432 * ln_age * ln_sbp) if bp_treated else (27.820 * ln_sbp - 6.087 * ln_age * ln_sbp)
            coeff += 0.691 if is_smoker else 0.0
            coeff += 0.874 if has_diabetes else 0.0
            mean_sum = 86.61
            base_surv = 0.9533

    exp_term = math.exp(coeff - mean_sum)
    raw_risk = 1.0 - (base_surv ** exp_term)
    risk_pct = round(max(0.1, min(99.0, raw_risk * 100.0)), 1)

    if risk_pct < 5.0:
        tier = 'Low Risk'
        color = 'emerald'
        recommendation = 'AHA/ACC recommends emphasizing lifestyle modifications. Statin therapy is generally not indicated unless LDL-C >= 190 mg/dL.'
    elif risk_pct < 7.5:
        tier = 'Borderline Risk'
        color = 'amber'
        recommendation = 'Assess risk-enhancing factors (family history, metabolic syndrome, elevated hs-CRP). Moderate-intensity statin may be considered.'
    elif risk_pct < 20.0:
        tier = 'Intermediate Risk'
        color = 'orange'
        recommendation = 'Initiate moderate-intensity statin therapy (target LDL-C reduction 30–49%). Consider coronary artery calcium (CAC) scan if risk decision is uncertain.'
    else:
        tier = 'High Risk'
        color = 'rose'
        recommendation = 'Initiate high-intensity statin therapy (target LDL-C reduction >= 50%) along with aggressive blood pressure and lifestyle optimization.'

    return {
        'tenYearRisk': risk_pct,
        'tier': tier,
        'badgeColor': color,
        'hdlEstimated': hdl,
        'recommendation': recommendation,
        'guideline': 'AHA/ACC 2018 Pooled Cohort Equations'
    }

def compute_cha2ds2_vasc(
    age: int,
    gender: str,
    sbp: int,
    dbp: int,
    glucose: int,
    cad_risk: int = 0,
    prior_stroke: bool = False,
    prior_hf: bool = False
) -> Dict[str, Any]:
    """
    Computes the CHA₂DS₂-VASc Score for clinical stroke and systemic thromboembolism risk.
    """
    score = 0
    breakdown = []

    if prior_hf or cad_risk >= 70:
        score += 1
        breakdown.append({"factor": "Congestive Heart Failure / Severe Cardiac Strain", "points": 1, "code": "C"})

    if sbp >= 140 or dbp >= 90:
        score += 1
        breakdown.append({"factor": f"Hypertension (BP {sbp}/{dbp} mmHg)", "points": 1, "code": "H"})

    if age >= 75:
        score += 2
        breakdown.append({"factor": f"Age >= 75 Years (Current: {age})", "points": 2, "code": "A₂"})
    elif age >= 65:
        score += 1
        breakdown.append({"factor": f"Age 65–74 Years (Current: {age})", "points": 1, "code": "A"})

    if glucose >= 126:
        score += 1
        breakdown.append({"factor": f"Diabetes Mellitus (Fasting Glucose {glucose} mg/dL)", "points": 1, "code": "D"})

    if prior_stroke:
        score += 2
        breakdown.append({"factor": "Prior Stroke / TIA / Thromboembolism", "points": 2, "code": "S₂"})

    if cad_risk >= 60:
        score += 1
        breakdown.append({"factor": "Vascular Disease / Atherosclerotic Plaque Burden", "points": 1, "code": "V"})

    is_female = str(gender).strip().lower() == 'female'
    if is_female:
        score += 1
        breakdown.append({"factor": "Sex Category (Female)", "points": 1, "code": "Sc"})

    annual_stroke_rates = {
        0: 0.2, 1: 0.6, 2: 2.2, 3: 3.2, 4: 4.8,
        5: 7.2, 6: 9.7, 7: 11.2, 8: 12.5, 9: 15.2
    }
    stroke_rate = annual_stroke_rates.get(min(9, score), 15.2)

    if (not is_female and score == 0) or (is_female and score == 1):
        category = "Low Risk"
        rec = "No antithrombotic or anticoagulant therapy indicated per ESC/AHA guidelines."
        badge = "emerald"
    elif not is_female and score == 1:
        category = "Moderate Risk"
        rec = "Oral anticoagulation (DOAC) should be considered after clinical risk-benefit evaluation."
        badge = "amber"
    else:
        category = "High Risk"
        rec = "Oral anticoagulation (DOAC: Apixaban, Rivaroxaban, Dabigatran) strongly recommended unless contraindicated."
        badge = "rose"

    return {
        "score": score,
        "maxScore": 9,
        "annualStrokeRisk": stroke_rate,
        "category": category,
        "badgeColor": badge,
        "recommendation": rec,
        "breakdown": breakdown,
        "guideline": "ESC/AHA 2024 Atrial Fibrillation & Stroke Guidelines"
    }

@router.post('/api/predict')
async def predict(
    payload: PredictRequest,
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    try:
        current_username = extract_username_from_auth(authorization) or 'user'

        # Extract structured parameters with clean fallback defaults
        personal_obj = payload.personal or PersonalData()
        lifestyle_obj = payload.lifestyle or LifestyleData()
        medical_obj = payload.medical or MedicalData()

        name = str(payload.name or personal_obj.name or 'Anonymous').strip()
        height = float(payload.height or personal_obj.height or 170.0)
        weight = float(payload.weight or personal_obj.weight or 70.0)
        age = int(payload.age or personal_obj.age or 35)
        gender = str(payload.gender or personal_obj.gender or 'male').lower()
        
        smoking = str(payload.smoking or lifestyle_obj.smoking or 'no').lower()
        alcohol = str(payload.alcohol or lifestyle_obj.alcohol or 'low').lower()
        activity = str(payload.physicalActivity or lifestyle_obj.physicalActivity or 'moderate').lower()
        sleep = float(payload.sleepDuration or lifestyle_obj.sleepDuration or 7.0)
        
        bp_systolic = int(payload.bpSystolic or medical_obj.bpSystolic or 120)
        bp_diastolic = int(payload.bpDiastolic or medical_obj.bpDiastolic or 80)
        cholesterol = int(payload.cholesterol or medical_obj.cholesterol or 180)
        glucose = int(payload.glucose or medical_obj.glucose or 90)
        insulin = int(payload.insulin or medical_obj.insulin or 8)
        heart_rate = int(payload.heartRate or medical_obj.heartRate or 70)
        
        hdl = payload.hdl if payload.hdl is not None else medical_obj.hdl
        ldl = payload.ldl if payload.ldl is not None else medical_obj.ldl
        hba1c = payload.hba1c if payload.hba1c is not None else medical_obj.hba1c
        bp_treated = bool(payload.bpTreated if payload.bpTreated is not None else medical_obj.bpTreated)
        prior_stroke = bool(payload.priorStroke if payload.priorStroke is not None else medical_obj.priorStroke)
        prior_hf = bool(payload.priorHF if payload.priorHF is not None else medical_obj.priorHF)
        race = str(payload.race or personal_obj.race or 'white_other').strip().lower()
        
        if height <= 0:
            raise HTTPException(status_code=400, detail='Height must be greater than zero')
        if weight <= 0:
            raise HTTPException(status_code=400, detail='Weight must be greater than zero')
            
        height_meters = height / 100.0
        bmi = round(weight / (height_meters * height_meters), 1)
        
        flat_input = {
            'age': age, 'height': height, 'weight': weight,
            'sleepDuration': sleep, 'bpSystolic': bp_systolic, 'bpDiastolic': bp_diastolic,
            'cholesterol': cholesterol, 'glucose': glucose, 'insulin': insulin, 'heartRate': heart_rate,
            'gender': gender, 'smoking': smoking, 'alcohol': alcohol, 'physicalActivity': activity
        }
        
        X = ml_engine.encode_input(flat_input, bmi)
        
        if ml_engine.scaler is None:
            ml_engine.load_ml_assets()
            if ml_engine.scaler is None:
                raise HTTPException(status_code=500, detail='Model assets (scaler) are not loaded on server.')
                
        X_num_scaled = ml_engine.scaler.transform(X[:, :11])
        X_scaled = X.copy()
        X_scaled[:, :11] = X_num_scaled
        
        # Execute ALL 5 ML algorithms simultaneously for both Heart Disease & Type 2 Diabetes
        heart_consensus = ml_engine.predict_all_algorithms('heart_disease', X_scaled)
        heart_risk_val = heart_consensus['master_risk']
        model_consensus = heart_consensus['models']
        consensus_agreement = heart_consensus['consensus_agreement']

        diabetes_consensus = ml_engine.predict_all_algorithms('diabetes', X_scaled)
        diabetes_risk_val = diabetes_consensus['master_risk']
        diabetes_model_consensus = diabetes_consensus['models']
        diabetes_consensus_agreement = diabetes_consensus['consensus_agreement']

        # Calculate Cardiovascular Sub-Risk Dimensions
        # 1. Coronary Artery Disease (CAD) Risk
        cad_z = -4.8 + 0.038*(bp_systolic - 120) + 0.030*(cholesterol - 180) + 0.032*(age - 40) + (1.2 if smoking == 'yes' else 0) + 0.04*(bmi - 24)
        cad_risk = int(np.clip(round(100 / (1 + np.exp(-cad_z))), 4, 98))
        
        # 2. Hypertensive Cardiac Strain
        hyp_z = -4.5 + 0.055*(bp_systolic - 120) + 0.035*(bp_diastolic - 80) + 0.025*(heart_rate - 70) + 0.03*(bmi - 24)
        hyp_risk = int(np.clip(round(100 / (1 + np.exp(-hyp_z))), 4, 98))
        
        # 3. Atherosclerosis & Plaque Accumulation Index
        ath_z = -4.6 + 0.042*(cholesterol - 180) + 0.022*(glucose - 90) + (0.9 if smoking == 'yes' else 0) + 0.035*(age - 40)
        ath_risk = int(np.clip(round(100 / (1 + np.exp(-ath_z))), 4, 98))
        
        # 4. Arrhythmia & Cardiac Rhythm Strain
        arr_z = -5.0 + 0.045*(heart_rate - 70) + 0.025*(bp_systolic - 120) + (0.8 if sleep < 6 else 0) + (0.6 if alcohol == 'high' else 0)
        arr_risk = int(np.clip(round(100 / (1 + np.exp(-arr_z))), 3, 96))
        
        # 5. Cardio-Metabolic Endothelial Risk
        met_z = -4.7 + 0.035*(glucose - 90) + 0.030*(insulin - 8) + 0.05*(bmi - 24) + (0.5 if activity == 'sedentary' else 0)
        met_risk = int(np.clip(round(100 / (1 + np.exp(-met_z))), 4, 98))

        # 6. Type 2 Diabetes / Metabolic Sub-Risk Dimensions
        homa_ir = round((glucose * insulin) / 405.0, 2)
        ins_z = -4.2 + 0.045 * (glucose - 95) + 0.055 * (insulin - 10) + 0.050 * (bmi - 24) + (0.5 if activity == 'sedentary' else 0)
        ins_risk = int(np.clip(round(100 / (1 + np.exp(-ins_z))), 4, 98))

        glyc_z = -4.6 + 0.060 * (glucose - 95) + 0.025 * (age - 45) + (0.5 if smoking == 'yes' else 0)
        glyc_risk = int(np.clip(round(100 / (1 + np.exp(-glyc_z))), 4, 98))

        met_criteria = sum([
            1 if glucose >= 100 else 0,
            1 if (bp_systolic >= 130 or bp_diastolic >= 85) else 0,
            1 if cholesterol >= 200 else 0,
            1 if bmi >= 26.5 else 0,
            1 if activity == 'sedentary' else 0
        ])
        met_syn_risk = int(np.clip(round(12 + met_criteria * 16.5), 5, 96))

        # 7. ACC/AHA 10-Year ASCVD Risk (Pooled Cohort Equations)
        ascvd_data = compute_ascvd_pce(
            age=age,
            gender=gender,
            total_chol=cholesterol,
            sbp=bp_systolic,
            hdl=hdl,
            bp_treated=bp_treated,
            smoking=smoking,
            diabetes_risk=diabetes_risk_val,
            glucose=glucose,
            race=race
        )

        # 8. CHA₂DS₂-VASc Stroke & Thromboembolism Clinical Risk Score
        cha2ds2_data = compute_cha2ds2_vasc(
            age=age,
            gender=gender,
            sbp=bp_systolic,
            dbp=bp_diastolic,
            glucose=glucose,
            cad_risk=cad_risk,
            prior_stroke=prior_stroke,
            prior_hf=prior_hf
        )

        # Overall Multi-Condition Composite Health Score
        cardio_risk_avg = (heart_risk_val * 0.4) + (cad_risk * 0.2) + (hyp_risk * 0.15) + (ath_risk * 0.15) + (arr_risk * 0.1)
        metabolic_risk_avg = (diabetes_risk_val * 0.45) + (ins_risk * 0.25) + (glyc_risk * 0.20) + (met_syn_risk * 0.10)
        composite_risk_avg = (cardio_risk_avg * 0.55) + (metabolic_risk_avg * 0.45)

        health_score = 100 - (composite_risk_avg * 0.75)
        if heart_risk_val >= 70 or bp_systolic >= 150:
            health_score -= 8
        if diabetes_risk_val >= 70 or glucose >= 140:
            health_score -= 8
        health_score = int(max(15, min(100, round(health_score))))
        
        explanations = {
            'heartDisease': [],
            'diabetes': [],
            'coronaryArtery': [],
            'hypertensiveHeart': [],
            'atherosclerosis': [],
            'arrhythmia': [],
            'cardioMetabolic': [],
            'insulinResistance': [],
            'glycemicStrain': [],
            'metabolicSyndrome': [],
            'ascvd': [],
            'cha2ds2Vasc': []
        }
        
        if bp_systolic >= 130 or bp_diastolic >= 85:
            explanations['heartDisease'].append(f"Elevated blood pressure ({bp_systolic}/{bp_diastolic} mmHg) increases myocardial workload and arterial stiffness.")
        if cholesterol > 200:
            explanations['heartDisease'].append(f"Total cholesterol of {cholesterol} mg/dL exceeds desirable range (<200 mg/dL), elevating coronary plaque risk.")
        if smoking == 'yes':
            explanations['heartDisease'].append("Active tobacco smoking damages arterial endothelial lining and accelerates coronary thrombosis.")
        if alcohol == 'high':
            explanations['heartDisease'].append("High alcohol consumption exerts direct cardiotoxic and arrhythmogenic stress.")
        if age > 45:
            explanations['heartDisease'].append(f"Age {age} increases baseline vascular calcification risk factors.")
        if bmi >= 25:
            explanations['heartDisease'].append(f"Elevated BMI ({bmi} kg/m²) increases systemic circulatory demands and cardiac output strain.")
            
        # Diabetes Explanations
        if glucose >= 126:
            explanations['diabetes'].append(f"Fasting blood glucose ({glucose} mg/dL) exceeds the ADA diagnostic threshold for Type 2 Diabetes (≥126 mg/dL).")
        elif glucose >= 100:
            explanations['diabetes'].append(f"Fasting blood glucose ({glucose} mg/dL) indicates Impaired Fasting Glucose / Pre-diabetes (100–125 mg/dL).")
        if insulin >= 15:
            explanations['diabetes'].append(f"Elevated fasting insulin ({insulin} µIU/mL) with HOMA-IR of {homa_ir} indicates peripheral insulin resistance.")
        if bmi >= 25:
            explanations['diabetes'].append(f"Elevated adiposity (BMI {bmi} kg/m²) releases free fatty acids that inhibit insulin signaling.")
        if activity == 'sedentary':
            explanations['diabetes'].append("Sedentary lifestyle reduces skeletal muscle GLUT4 translocation, diminishing glucose uptake.")
        if age >= 45:
            explanations['diabetes'].append(f"Age {age} increases likelihood of progressive pancreatic beta-cell workload stress.")

        if cholesterol >= 220:
            explanations['coronaryArtery'].append(f"Elevated serum lipids ({cholesterol} mg/dL) accelerate coronary atheroma formation.")
        if smoking == 'yes':
            explanations['coronaryArtery'].append("Tobacco nicotine promotes coronary vasoconstriction and arterial spasms.")
        if age >= 50:
            explanations['coronaryArtery'].append(f"Age {age} increases coronary artery calcium deposition trajectory.")
            
        if bp_systolic >= 140 or bp_diastolic >= 90:
            explanations['hypertensiveHeart'].append(f"Hypertension Stage 2 ({bp_systolic}/{bp_diastolic} mmHg) induces left ventricular hypertrophy pressure load.")
        elif bp_systolic >= 130:
            explanations['hypertensiveHeart'].append(f"Hypertension Stage 1 ({bp_systolic} mmHg systolic) raises arterial pulse pressure.")
        if heart_rate >= 80:
            explanations['hypertensiveHeart'].append(f"Elevated resting heart rate of {heart_rate} bpm increases chronic vascular shear stress.")

        if cholesterol >= 200 or glucose >= 100:
            explanations['atherosclerosis'].append("Dyslipidemia and impaired glucose synergistically accelerate arterial intima thickening.")
        if bmi >= 28:
            explanations['atherosclerosis'].append(f"Adiposity (BMI {bmi}) stimulates pro-inflammatory cytokines promoting plaque vulnerability.")

        if heart_rate >= 85:
            explanations['arrhythmia'].append(f"Resting heart rate of {heart_rate} bpm reflects elevated sympathetic cardiac tone.")
        if sleep < 6:
            explanations['arrhythmia'].append("Sleep deprivation (<6 hrs) alters autonomic heart rate variability (HRV).")
        if alcohol in ['high', 'moderate']:
            explanations['arrhythmia'].append("Alcohol intake increases susceptibility to atrial ectopic beats.")

        if glucose >= 100 or insulin > 15:
            explanations['cardioMetabolic'].append(f"Elevated fasting glucose ({glucose} mg/dL) or insulin ({insulin} µIU/mL) impairs nitric oxide vasodilation.")
        if activity == 'sedentary':
            explanations['cardioMetabolic'].append("Sedentary physical profile reduces coronary capillary density and muscular oxygen uptake.")

        if insulin >= 12 or homa_ir >= 2.0:
            explanations['insulinResistance'].append(f"Calculated HOMA-IR score of {homa_ir} indicates compensatory hyperinsulinemia.")
        if glucose >= 110:
            explanations['glycemicStrain'].append(f"Persistent fasting hyperglycemia ({glucose} mg/dL) increases advanced glycation end-products (AGEs).")
        if met_criteria >= 3:
            explanations['metabolicSyndrome'].append(f"Patient exhibits {met_criteria}/5 metabolic syndrome criteria (hyperglycemia, hypertension, adiposity, dyslipidemia).")

        # ASCVD and CHA2DS2-VASc explanations
        explanations['ascvd'].append(f"AHA/ACC 10-Year ASCVD Risk is calculated at {ascvd_data['tenYearRisk']}% ({ascvd_data['tier']}).")
        explanations['ascvd'].append(ascvd_data['recommendation'])

        explanations['cha2ds2Vasc'].append(f"CHA₂DS₂-VASc Clinical Score of {cha2ds2_data['score']}/9 indicates {cha2ds2_data['category']} with ~{cha2ds2_data['annualStrokeRisk']}% annual stroke risk.")
        explanations['cha2ds2Vasc'].append(cha2ds2_data['recommendation'])
        if cha2ds2_data['breakdown']:
            for b in cha2ds2_data['breakdown']:
                explanations['cha2ds2Vasc'].append(f"• +{b['points']} pt ({b.get('code', '')}): {b['factor']}")

        for k in explanations:
            if not explanations[k]:
                explanations[k].append("All evaluated biomarkers in this category are within standard ADA/AHA reference limits.")
                
        recs = {
            "immediate": [],
            "lifestyle": [],
            "medical": []
        }
        
        if bp_systolic >= 160 or bp_diastolic >= 100:
            recs["immediate"].append(f"🚨 Urgent: Clinical evaluation required for severe hypertension ({bp_systolic}/{bp_diastolic} mmHg).")
        elif bp_systolic >= 140 or bp_diastolic >= 90:
            recs["immediate"].append(f"Schedule clinical consultation for Stage 2 hypertension management ({bp_systolic}/{bp_diastolic} mmHg).")
            
        if heart_risk_val >= 65:
            recs["immediate"].append("Consult a cardiologist for comprehensive diagnostic cardiovascular evaluation and 12-lead ECG.")
        if diabetes_risk_val >= 65 or glucose >= 140:
            recs["immediate"].append("Consult an endocrinologist or primary physician for formal diabetes diagnostic evaluation and glucose tolerance testing.")
        if cholesterol >= 240 or ascvd_data['tenYearRisk'] >= 20.0:
            recs["immediate"].append(f"Discuss targeted lipid-lowering therapy and high-intensity statin with your physician (10-Yr ASCVD Risk: {ascvd_data['tenYearRisk']}%).")
            
        if smoking == 'yes':
            recs["lifestyle"].append("Enroll in an evidence-based tobacco cessation program. Quitting reduces cardiac risk by 50% within 1 year.")
        if activity == 'sedentary':
            recs["lifestyle"].append("Incorporate 150 minutes of moderate-intensity aerobic cardio weekly per AHA/ADA guidelines.")
        if glucose >= 100 or diabetes_risk_val >= 35:
            recs["lifestyle"].append("Adopt a low-glycemic Mediterranean dietary pattern: emphasize complex fiber and reduce refined carbohydrates.")
            recs["lifestyle"].append("Take a 10-15 minute walk following major meals to stimulate insulin-independent muscle glucose disposal.")
        if bp_systolic >= 130 or cholesterol >= 200:
            recs["lifestyle"].append("Adopt the DASH dietary pattern: limit sodium to <2,000 mg/day and increase potassium, magnesium, and dietary fiber.")
        if bmi >= 25:
            recs["lifestyle"].append("Target a 5-10% sustained body weight reduction to substantially relieve myocardial workload and reverse insulin resistance.")
        if sleep < 7:
            recs["lifestyle"].append("Prioritize 7-8 hours of restful sleep nightly to optimize parasympathetic cardiac recovery and cortisol balance.")
            
        if bp_systolic >= 130 or bp_diastolic >= 80:
            recs["medical"].append("Perform daily calibrated blood pressure logs (morning and evening at rest).")
        if cholesterol >= 200:
            recs["medical"].append("Order a comprehensive fasting Lipid Panel (LDL-C, HDL-C, Triglycerides, Non-HDL).")
        if glucose >= 100 or diabetes_risk_val >= 30:
            recs["medical"].append("Order a diagnostic HbA1c (Glycated Hemoglobin) test to monitor 90-day mean glycemic control (target < 5.7%).")
        if ascvd_data['tenYearRisk'] >= 7.5:
            recs["medical"].append(f"Intermediate ASCVD Risk ({ascvd_data['tenYearRisk']}%): Discuss a Coronary Artery Calcium (CAC) CT scan with your doctor.")
        elif age >= 45 or heart_risk_val >= 40:
            recs["medical"].append("Discuss a Coronary Artery Calcium (CAC) CT scan or Echocardiogram with your doctor.")

        if cha2ds2_data['score'] >= 2:
            recs["medical"].append(f"CHA₂DS₂-VASc Score of {cha2ds2_data['score']}/9: Consult physician or cardiologist regarding oral anticoagulation (DOAC) for stroke prophylaxis.")
            
        if not recs["immediate"] and not recs["lifestyle"]:
            recs["lifestyle"].append("Maintain your excellent cardiovascular conditioning and healthy metabolic habits!")
        if not recs["medical"]:
            recs["medical"].append("Continue with annual preventive cardiac and metabolic screenings.")
            
        confidence = 100
        
        results = {
            'risks': {
                'heartDisease': heart_risk_val,
                'diabetes': diabetes_risk_val,
                'coronaryArtery': cad_risk,
                'hypertensiveHeart': hyp_risk,
                'atherosclerosis': ath_risk,
                'arrhythmia': arr_risk,
                'cardioMetabolic': met_risk,
                'insulinResistance': ins_risk,
                'glycemicStrain': glyc_risk,
                'metabolicSyndrome': met_syn_risk,
                'ascvd': ascvd_data['tenYearRisk'],
                'cha2ds2Vasc': cha2ds2_data['score']
            },
            'overallScore': health_score,
            'confidence': confidence,
            'homaIR': homa_ir,
            'ascvd': ascvd_data,
            'cha2ds2Vasc': cha2ds2_data,
            'consensusAgreement': consensus_agreement,
            'modelConsensus': model_consensus,
            'diabetesConsensusAgreement': diabetes_consensus_agreement,
            'diabetesModelConsensus': diabetes_model_consensus,
            'recommendations': recs,
            'explanations': {
                'heart': explanations['heartDisease'],
                'heartDisease': explanations['heartDisease'],
                'diabetes': explanations['diabetes'],
                'coronaryArtery': explanations['coronaryArtery'],
                'hypertensiveHeart': explanations['hypertensiveHeart'],
                'atherosclerosis': explanations['atherosclerosis'],
                'arrhythmia': explanations['arrhythmia'],
                'cardioMetabolic': explanations['cardioMetabolic'],
                'insulinResistance': explanations['insulinResistance'],
                'glycemicStrain': explanations['glycemicStrain'],
                'metabolicSyndrome': explanations['metabolicSyndrome'],
                'ascvd': explanations['ascvd'],
                'cha2ds2Vasc': explanations['cha2ds2Vasc']
            }
        }
        
        assess_id = f"assess-{secrets.token_hex(4)}-consensus"
        timestamp_str = datetime.now().isoformat()
        
        personal_info = {'name': name, 'age': age, 'gender': gender, 'height': height, 'weight': weight, 'bmi': bmi, 'race': race}
        lifestyle_info = {'smoking': smoking, 'alcohol': alcohol, 'physicalActivity': activity, 'sleepDuration': sleep}
        medical_info = {
            'bpSystolic': bp_systolic, 'bpDiastolic': bp_diastolic, 'cholesterol': cholesterol,
            'glucose': glucose, 'insulin': insulin, 'heartRate': heart_rate,
            'hdl': hdl, 'ldl': ldl, 'hba1c': hba1c, 'bpTreated': bp_treated, 'priorStroke': prior_stroke, 'priorHF': prior_hf
        }
        
        try:
            db_execute(
                "INSERT INTO assessments (id, username, name, timestamp, personal, lifestyle, medical, results) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    assess_id,
                    current_username,
                    name,
                    timestamp_str,
                    json.dumps(personal_info),
                    json.dumps(lifestyle_info),
                    json.dumps(medical_info),
                    json.dumps(results)
                )
            )
        except Exception as db_err:
            logger.exception("Failed to write assessment to database")
            
        log_audit_event(
            "ASSESSMENT_CREATE", 
            "CLINICAL_ASSESSMENT", 
            current_username, 
            f"Assessment calculated: Cardio Risk: {heart_risk_val}% | Score: {health_score}/100 | Patient: {name}", 
            status="SUCCESS"
        )

        return {
            'success': True,
            'assessment': {
                'id': assess_id,
                'username': current_username,
                'name': name,
                'timestamp': timestamp_str,
                'personal': personal_info,
                'lifestyle': lifestyle_info,
                'medical': medical_info,
                'results': results
            },
            'results': results,
            'id': assess_id,
            'username': current_username,
            'name': name,
            'timestamp': timestamp_str,
            'personal': personal_info,
            'lifestyle': lifestyle_info,
            'medical': medical_info
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error during prediction")
        raise HTTPException(status_code=500, detail="Prediction calculation failed due to an internal server error.")

@router.get('/api/assessments')
async def get_assessments(
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    try:
        current_username = extract_username_from_auth(authorization)
        if not current_username:
            raise HTTPException(status_code=401, detail="Invalid authorization token")

        # Multi-Tenant User Scoping: Admin sees all records, regular user sees only their own
        if is_admin_user(current_username):
            records = db_fetchall("SELECT * FROM assessments ORDER BY timestamp DESC")
        else:
            records = db_fetchall("SELECT * FROM assessments WHERE LOWER(username) = LOWER(%s) ORDER BY timestamp DESC", (current_username,))
        
        for r in records:
            r['personal'] = json.loads(r['personal']) if isinstance(r['personal'], str) else r['personal']
            r['lifestyle'] = json.loads(r['lifestyle']) if isinstance(r['lifestyle'], str) else r['lifestyle']
            r['medical'] = json.loads(r['medical']) if isinstance(r['medical'], str) else r['medical']
            r['results'] = json.loads(r['results']) if isinstance(r['results'], str) else r['results']
            
            r['results']['id'] = r['id']
            r['results']['name'] = r['name']
            r['results']['timestamp'] = r['timestamp']
            r['results']['personal'] = r['personal']
            r['results']['lifestyle'] = r['lifestyle']
            r['results']['medical'] = r['medical']
            
        return records
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error retrieving assessments")
        raise HTTPException(status_code=500, detail="Failed to retrieve assessments log.")

@router.delete('/api/assessments/{id}')
async def delete_assessment(
    id: str,
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    try:
        current_username = extract_username_from_auth(authorization)
        if not current_username:
            raise HTTPException(status_code=401, detail="Invalid authorization token")

        record = db_fetchone("SELECT id, username FROM assessments WHERE id = %s", (id,))
        if not record:
            raise HTTPException(status_code=404, detail=f"Assessment record with id '{id}' not found.")

        # IDOR Ownership Guard: Only the owner or an administrator can delete
        record_owner = record.get('username', '')
        if not is_admin_user(current_username) and record_owner.lower() != current_username.lower():
            log_audit_event("IDOR_VIOLATION_ATTEMPT", "SECURITY", current_username, f"Unauthorized delete attempt on assessment {id} owned by {record_owner}", status="FAILED")
            raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to delete this assessment record.")

        db_execute("DELETE FROM assessments WHERE id = %s", (id,))
        log_audit_event("ASSESSMENT_DELETE", "CLINICAL_ASSESSMENT", current_username, f"Deleted assessment record {id} (Owner: {record_owner})", status="SUCCESS")
        return {'success': True, 'message': f'Record {id} successfully deleted from database.'}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error deleting assessment")
        raise HTTPException(status_code=500, detail="Failed to delete assessment record.")

@router.get('/api/metrics')
async def get_metrics(token: str = Depends(get_auth_token)):
    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, "r") as f:
                metrics_data = json.load(f)
            return metrics_data
        except Exception as e:
            logger.exception("Failed to read model metrics")
            raise HTTPException(status_code=500, detail="Failed to read metrics file.")
    else:
        raise HTTPException(status_code=404, detail='Model metrics file not found. Please train models first.')

@router.post('/api/retrain')
async def retrain(token: str = Depends(get_admin_token)):
    try:
        print("Received retraining request. Executing pipeline_trainer.py in background thread...")
        from pipeline_trainer import run_training_pipeline
        metrics_data = await asyncio.to_thread(run_training_pipeline)
        
        await asyncio.to_thread(ml_engine.load_ml_assets)
        log_audit_event("MODEL_RETRAIN", "ML_ENGINE", "admin", "Successfully retrained 10 multi-disease ML models (Heart Disease & Type 2 Diabetes) via training pipeline", status="SUCCESS")
        
        return {
            'success': True,
            'message': 'Models retrained and reloaded successfully.',
            'metrics': metrics_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Retraining pipeline error")
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

