import os
import json
import subprocess
import sys
from datetime import datetime
import numpy as np
from fastapi import APIRouter, Request, HTTPException, Depends

from config import BASE_DIR, MODELS_DIR
from auth import get_auth_token
from database import db_execute, db_fetchall
import ml_engine

router = APIRouter()

@router.post('/api/predict')
async def predict(request: Request):
    try:
        data = await request.json()
        if not data:
            raise HTTPException(status_code=400, detail='No input payload provided')
            
        name = data.get('name', 'Anonymous')
        height = float(data.get('height', 170))
        weight = float(data.get('weight', 70))
        
        if height <= 0:
            raise HTTPException(status_code=400, detail='Height must be positive')
            
        height_meters = height / 100
        bmi = round(weight / (height_meters * height_meters), 1)
        
        X = ml_engine.encode_input(data, bmi)
        
        if ml_engine.scaler is None:
            ml_engine.load_ml_assets()
            if ml_engine.scaler is None:
                raise HTTPException(status_code=500, detail='Model assets (scaler) are not loaded on server.')
                
        X_num_scaled = ml_engine.scaler.transform(X[:, :11])
        X_scaled = X.copy()
        X_scaled[:, :11] = X_num_scaled
        
        passed_alg = str(data.get('algorithm', 'auto')).lower()
        
        predictions = {}
        selected_algorithms = {}
        for disease in ml_engine.diseases:
            if passed_alg in ml_engine.algs:
                best_alg = passed_alg
            else:
                best_alg = ml_engine.select_best_algorithm_for_disease(disease)
                
            selected_algorithms[disease] = best_alg
            
            disease_models = ml_engine.models.get(disease, {})
            model = disease_models.get(best_alg)
            if model is None:
                model = disease_models.get('random_forest') or disease_models.get('xgboost')
                if model is None and len(disease_models) > 0:
                    model = list(disease_models.values())[0]
                if model is None:
                    raise HTTPException(status_code=500, detail=f'Model for {disease} not found')
                best_alg = 'random_forest'
                selected_algorithms[disease] = best_alg
                
            prob = model.predict_proba(X_scaled)[0][1]
            predictions[disease] = int(round(prob * 100))
            
        print(f"Predictions run. Selected algorithms: {selected_algorithms}")
            
        heart_risk_val = predictions.get('heart_disease', 20)
        
        age = int(data.get('age', 35))
        gender = str(data.get('gender', 'male')).lower()
        glucose = int(data.get('glucose', 90))
        insulin = int(data.get('insulin', 8))
        bp_systolic = int(data.get('bpSystolic', 120))
        bp_diastolic = int(data.get('bpDiastolic', 80))
        cholesterol = int(data.get('cholesterol', 180))
        smoking = str(data.get('smoking', 'no')).lower()
        alcohol = str(data.get('alcohol', 'low')).lower()
        activity = str(data.get('physicalActivity', 'moderate')).lower()
        sleep = float(data.get('sleepDuration', 7))
        heart_rate = int(data.get('heartRate', 70))
        
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

        # Overall Cardiovascular Health Score
        cardio_risk_avg = (heart_risk_val * 0.4) + (cad_risk * 0.2) + (hyp_risk * 0.15) + (ath_risk * 0.15) + (arr_risk * 0.1)
        health_score = 100 - (cardio_risk_avg * 0.75)
        if heart_risk_val >= 70 or bp_systolic >= 150:
            health_score -= 10
        health_score = int(max(15, min(100, round(health_score))))
        
        explanations = {
            'heartDisease': [],
            'coronaryArtery': [],
            'hypertensiveHeart': [],
            'atherosclerosis': [],
            'arrhythmia': [],
            'cardioMetabolic': []
        }
        
        # Clinical Explanations for Heart Disease
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

        for k in explanations:
            if not explanations[k]:
                explanations[k].append("All cardiovascular biomarkers within standard AHA/ACC reference limits.")
                
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
        if cholesterol >= 240:
            recs["immediate"].append("Discuss targeted lipid-lowering therapy and atherogenic risk reduction with your physician.")
            
        if smoking == 'yes':
            recs["lifestyle"].append("Enroll in an evidence-based tobacco cessation program. Quitting reduces cardiac risk by 50% within 1 year.")
        if activity == 'sedentary':
            recs["lifestyle"].append("Incorporate 150 minutes of moderate-intensity aerobic cardio (brisk walking, swimming) weekly per AHA guidelines.")
        if bp_systolic >= 130 or cholesterol >= 200:
            recs["lifestyle"].append("Adopt the DASH dietary pattern: limit sodium to <2,000 mg/day and increase potassium, magnesium, and dietary fiber.")
        if bmi >= 25:
            recs["lifestyle"].append("Target a 5-10% sustained body weight reduction to substantially relieve myocardial workload.")
        if sleep < 7:
            recs["lifestyle"].append("Prioritize 7-8 hours of restful sleep nightly to optimize parasympathetic cardiac recovery.")
            
        if bp_systolic >= 130 or bp_diastolic >= 80:
            recs["medical"].append("Perform daily calibrated blood pressure logs (morning and evening at rest).")
        if cholesterol >= 200:
            recs["medical"].append("Order a comprehensive fasting Lipid Panel (LDL-C, HDL-C, Triglycerides, Non-HDL).")
        if age >= 45 or heart_risk_val >= 40:
            recs["medical"].append("Discuss a Coronary Artery Calcium (CAC) CT scan or Echocardiogram with your doctor.")
            
        if not recs["immediate"] and not recs["lifestyle"]:
            recs["lifestyle"].append("Maintain your excellent cardiovascular conditioning and healthy lifestyle habits!")
        if not recs["medical"]:
            recs["medical"].append("Continue with annual preventive cardiac and biometric screenings.")
            
        confidence = 100
        
        results = {
            'risks': {
                'heartDisease': heart_risk_val,
                'coronaryArtery': cad_risk,
                'hypertensiveHeart': hyp_risk,
                'atherosclerosis': ath_risk,
                'arrhythmia': arr_risk,
                'cardioMetabolic': met_risk
            },
            'overallScore': health_score,
            'confidence': confidence,
            'recommendations': recs,
            'explanations': {
                'heart': explanations['heartDisease'],
                'heartDisease': explanations['heartDisease'],
                'coronaryArtery': explanations['coronaryArtery'],
                'hypertensiveHeart': explanations['hypertensiveHeart'],
                'atherosclerosis': explanations['atherosclerosis'],
                'arrhythmia': explanations['arrhythmia'],
                'cardioMetabolic': explanations['cardioMetabolic']
            }
        }
        
        alg_suffix = passed_alg if passed_alg in ml_engine.algs else 'auto'
        assess_id = f"assess-{int(np.round(np.random.rand() * 1000000))}-{alg_suffix}"
        timestamp_str = datetime.now().isoformat()
        
        personal_info = {'name': name, 'age': age, 'gender': gender, 'height': height, 'weight': weight, 'bmi': bmi}
        lifestyle_info = {'smoking': smoking, 'alcohol': alcohol, 'physicalActivity': activity, 'sleepDuration': sleep}
        medical_info = {'bpSystolic': bp_systolic, 'bpDiastolic': bp_diastolic, 'cholesterol': cholesterol, 'glucose': glucose, 'insulin': insulin, 'heartRate': heart_rate}
        
        try:
            db_execute(
                "INSERT INTO assessments (id, name, timestamp, personal, lifestyle, medical, results) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (
                    assess_id,
                    name,
                    timestamp_str,
                    json.dumps(personal_info),
                    json.dumps(lifestyle_info),
                    json.dumps(medical_info),
                    json.dumps(results)
                )
            )
            print(f"Saved assessment {assess_id} to database successfully.")
        except Exception as db_err:
            print(f"Failed to write to database: {db_err}")
            
        results_with_metadata = results.copy()
        results_with_metadata['id'] = assess_id
        results_with_metadata['name'] = name
        results_with_metadata['timestamp'] = timestamp_str
        results_with_metadata['personal'] = personal_info
        results_with_metadata['lifestyle'] = lifestyle_info
        results_with_metadata['medical'] = medical_info
        
        return results_with_metadata
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/api/assessments')
async def get_assessments(token: str = Depends(get_auth_token)):
    try:
        records = db_fetchall("SELECT * FROM assessments ORDER BY timestamp DESC")
        
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
        print(f"Error retrieving database logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/api/assessments/{id}')
async def delete_assessment(id: str, token: str = Depends(get_auth_token)):
    try:
        db_execute("DELETE FROM assessments WHERE id = %s", (id,))
        return {'success': True, 'message': f'Record {id} successfully deleted from database.'}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting record {id} from database: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/api/metrics')
async def get_metrics(token: str = Depends(get_auth_token)):
    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, "r") as f:
                metrics_data = json.load(f)
            return metrics_data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f'Failed to read metrics: {e}')
    else:
        raise HTTPException(status_code=404, detail='Model metrics file not found. Please train models first.')

@router.post('/api/retrain')
async def retrain(token: str = Depends(get_auth_token)):
    try:
        print("Received retraining request. Executing train_models.py...")
        train_script = os.path.join(BASE_DIR, "train_models.py")
        result = subprocess.run([sys.executable, train_script], capture_output=True, text=True, check=True, cwd=BASE_DIR)
        print("Retraining completed successfully.")
        
        ml_engine.load_ml_assets()
        
        metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
        if os.path.exists(metrics_path):
            with open(metrics_path, "r") as f:
                metrics_data = json.load(f)
            return {
                'success': True,
                'message': 'Models retrained and reloaded successfully.',
                'metrics': metrics_data
            }
        else:
            return {'success': True, 'message': 'Models retrained but metrics file not found.'}
            
    except subprocess.CalledProcessError as e:
        print(f"Retraining script failed: {e.stderr}")
        raise HTTPException(status_code=500, detail=f'Training script execution failed: {e.stderr}')
    except HTTPException:
        raise
    except Exception as e:
        print(f"Retraining error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
