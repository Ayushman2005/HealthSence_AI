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
from ml_engine import (
    scaler, models, diseases, algs, load_ml_assets,
    select_best_algorithm_for_disease, encode_input
)

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
        
        X = encode_input(data, bmi)
        
        global scaler
        if scaler is None:
            load_ml_assets()
            if scaler is None:
                raise HTTPException(status_code=500, detail='Model assets (scaler) are not loaded on server.')
                
        X_num_scaled = scaler.transform(X[:, :11])
        X_scaled = X.copy()
        X_scaled[:, :11] = X_num_scaled
        
        passed_alg = str(data.get('algorithm', 'auto')).lower()
        
        predictions = {}
        selected_algorithms = {}
        for disease in diseases:
            if passed_alg in algs:
                best_alg = passed_alg
            else:
                best_alg = select_best_algorithm_for_disease(disease)
                
            selected_algorithms[disease] = best_alg
            
            disease_models = models.get(disease, {})
            model = disease_models.get(best_alg)
            if model is None:
                model = disease_models.get('random_forest')
                if model is None:
                    raise HTTPException(status_code=500, detail=f'Model for {disease} not found')
                best_alg = 'random_forest'
                selected_algorithms[disease] = best_alg
                
            prob = model.predict_proba(X_scaled)[0][1]
            predictions[disease] = int(round(prob * 100))
            
        print(f"Predictions run. Selected algorithms: {selected_algorithms}")
            
        avg_risk = sum(predictions.values()) / len(diseases)
        health_score = 100 - (avg_risk * 0.75)
        high_alerts = sum(1 for r in predictions.values() if r >= 70)
        health_score -= (high_alerts * 8)
        health_score = int(max(15, min(100, round(health_score))))
        
        explanations = {
            'diabetes': [],
            'heartDisease': [],
            'kidneyDisease': [],
            'liverDisease': [],
            'hypertension': [],
            'stroke': []
        }
        
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
        
        if glucose > 100:
            explanations['diabetes'].append(f"Fasting blood glucose of {glucose} mg/dL exceeds normal limit (<100 mg/dL).")
        if bmi >= 25:
            explanations['diabetes'].append(f"Elevated BMI of {bmi} kg/m² indicates overweight/obesity.")
        if insulin > 15:
            explanations['diabetes'].append(f"Fasting insulin of {insulin} µIU/mL suggests insulin resistance.")
        if age > 45:
            explanations['diabetes'].append(f"Age of {age} increases baseline risk factors.")
        if activity == 'sedentary':
            explanations['diabetes'].append("Sedentary lifestyle reduces insulin sensitivity.")
            
        if bp_systolic >= 130 or bp_diastolic >= 85:
            explanations['heartDisease'].append(f"Elevated blood pressure ({bp_systolic}/{bp_diastolic} mmHg) increases cardiovascular strain.")
        if cholesterol > 200:
            explanations['heartDisease'].append(f"Cholesterol level of {cholesterol} mg/dL is borderline/high.")
        if smoking == 'yes':
            explanations['heartDisease'].append("Active tobacco smoking is a major risk factor for coronary plaque.")
        if alcohol == 'high':
            explanations['heartDisease'].append("Heavy alcohol usage impacts myocardial cells.")
        if age > 45:
            explanations['heartDisease'].append(f"Age of {age} increases cardiovascular baseline parameters.")
            
        if bp_systolic >= 130 or bp_diastolic >= 85:
            explanations['kidneyDisease'].append(f"Hypertension ({bp_systolic}/{bp_diastolic} mmHg) damages renal blood vessels.")
        if glucose > 100:
            explanations['kidneyDisease'].append(f"Elevated fasting glucose of {glucose} mg/dL increases kidney filtering workload.")
        if age > 50:
            explanations['kidneyDisease'].append(f"Natural decline in glomerular filtration rate (GFR) over age 50.")
            
        if alcohol == 'high':
            explanations['liverDisease'].append("Heavy alcohol consumption increases liver toxicity risk.")
        elif alcohol == 'moderate':
            explanations['liverDisease'].append("Moderate alcohol consumption adds liver metabolism loads.")
        if bmi >= 25:
            explanations['liverDisease'].append(f"Elevated BMI of {bmi} kg/m² contributes to non-alcoholic fatty liver (NAFLD) risk.")
        if cholesterol > 220:
            explanations['liverDisease'].append(f"Hyperlipidemia (cholesterol {cholesterol} mg/dL) contributes to fatty deposits in liver tissue.")
            
        if bp_systolic >= 130 or bp_diastolic >= 85:
            explanations['hypertension'].append(f"High blood pressure ({bp_systolic}/{bp_diastolic} mmHg) indicates hypertension baseline.")
        if bmi >= 25:
            explanations['hypertension'].append(f"Elevated BMI of {bmi} kg/m² increases vascular resistance.")
        if heart_rate >= 80:
            explanations['hypertension'].append(f"Resting heart rate of {heart_rate} bpm indicates elevated cardiac tone.")
        if alcohol in ['high', 'moderate']:
            explanations['hypertension'].append("Regular alcohol consumption elevates systemic blood pressure.")

        if bp_systolic >= 140 or bp_diastolic >= 90:
            explanations['stroke'].append(f"Hypertension ({bp_systolic}/{bp_diastolic} mmHg) is a primary risk factor for cerebrovascular events.")
        if cholesterol >= 220:
            explanations['stroke'].append(f"High cholesterol ({cholesterol} mg/dL) increases arterial plaque and ischemia risk.")
        if smoking == 'yes':
            explanations['stroke'].append("Active smoking damages cerebral blood vessels.")
        if age >= 55:
            explanations['stroke'].append(f"Age of {age} significantly increases cerebrovascular vulnerability.")

        for k in explanations:
            if not explanations[k]:
                explanations[k].append("All parameters within standard clinical limits.")
                
        recs = {
            "immediate": [],
            "lifestyle": [],
            "medical": []
        }
        
        if bp_systolic >= 150 or bp_diastolic >= 95:
            recs["immediate"].append(f"Seek clinical evaluation for high blood pressure ({bp_systolic}/{bp_diastolic} mmHg).")
        if glucose >= 150:
            recs["immediate"].append(f"Consult an endocrinologist regarding elevated fasting blood glucose ({glucose} mg/dL).")
        if predictions['heart_disease'] >= 70:
            recs["immediate"].append("Consult a cardiologist for a cardiovascular diagnostic checkup.")
        if predictions['liver_disease'] >= 70:
            recs["immediate"].append("Schedule a hepatic ultrasound examination with your doctor.")
        if predictions.get('hypertension', 0) >= 70:
            recs["immediate"].append("Consult a physician for hypertension management and blood pressure control.")
        if predictions.get('stroke', 0) >= 70:
            recs["immediate"].append("Seek urgent medical consultation for stroke and cardiovascular prevention.")
            
        if smoking == 'yes':
            recs["lifestyle"].append("Enroll in a tobacco cessation program. Smoking accelerates vascular damage.")
        if alcohol in ['high', 'moderate']:
            recs["lifestyle"].append("Limit alcohol intake to normal parameters or abstain completely.")
        if activity == 'sedentary':
            recs["lifestyle"].append("Incorporate 150 minutes of moderate aerobic activity weekly.")
        if bmi >= 25:
            recs["lifestyle"].append("Focus on dietary modifications aimed at 5-10% body weight reduction.")
        if sleep < 7:
            recs["lifestyle"].append("Improve sleep hygiene to ensure 7-8 hours of sleep per night.")
            
        if glucose >= 100:
            recs["medical"].append("Request an HbA1c blood test to screen for pre-diabetes/diabetes.")
        if bp_systolic >= 130 or bp_diastolic >= 80:
            recs["medical"].append("Track blood pressure readings daily at home.")
        if cholesterol >= 200:
            recs["medical"].append("Discuss a lipid panel test and cholesterol management with your doctor.")
            
        if not recs["lifestyle"]:
            recs["lifestyle"].append("Maintain your excellent physical fitness and healthy habits!")
        if not recs["medical"]:
            recs["medical"].append("Continue with routine annual health screenings.")
            
        confidence = 100
        
        results = {
            'risks': {
                'diabetes': predictions['diabetes'],
                'heartDisease': predictions['heart_disease'],
                'kidneyDisease': predictions['kidney_disease'],
                'liverDisease': predictions['liver_disease'],
                'hypertension': predictions['hypertension'],
                'stroke': predictions['stroke']
            },
            'overallScore': health_score,
            'confidence': confidence,
            'recommendations': recs,
            'explanations': {
                'diabetes': explanations['diabetes'],
                'heart': explanations['heartDisease'],
                'kidney': explanations['kidneyDisease'],
                'liver': explanations['liverDisease'],
                'hypertension': explanations['hypertension'],
                'stroke': explanations['stroke']
            }
        }
        
        alg_suffix = passed_alg if passed_alg in algs else 'auto'
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
        
        load_ml_assets()
        
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
