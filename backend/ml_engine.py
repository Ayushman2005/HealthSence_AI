import os
import json
import pickle
import numpy as np

from config import MODELS_DIR

scaler = None
feature_names = []
models = {}
model_metrics = {}

diseases = ['heart_disease']
algs = ['xgboost', 'random_forest', 'svm', 'logistic_regression', 'decision_tree']

def load_ml_assets():
    global scaler, feature_names, models, model_metrics
    print("Loading Machine Learning assets...")
    
    # Load Scaler
    scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
    if os.path.exists(scaler_path):
        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)
        print("  Scaler loaded successfully.")
    else:
        print("  WARNING: scaler.pkl not found. Please train models first.")
        
    # Load Feature Names list
    names_path = os.path.join(MODELS_DIR, "feature_names.json")
    if os.path.exists(names_path):
        with open(names_path, "r") as f:
            feature_names = json.load(f)
        print("  Feature names mapping loaded successfully.")
        
    # Load model metrics
    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, "r") as f:
                model_metrics = json.load(f)
            print("  Model metrics loaded successfully.")
        except Exception as e:
            print(f"  WARNING: Failed to load model_metrics.json: {e}")
            
    # Load all models
    loaded_count = 0
    for disease in diseases:
        models[disease] = {}
        for alg in algs:
            model_path = os.path.join(MODELS_DIR, f"{disease}_{alg}.pkl")
            if os.path.exists(model_path):
                with open(model_path, "rb") as f:
                    models[disease][alg] = pickle.load(f)
                loaded_count += 1
    print(f"  Loaded {loaded_count}/{len(diseases)*len(algs)} models successfully from {MODELS_DIR}.")

def select_best_algorithm_for_disease(disease: str) -> str:
    global model_metrics
    pref_order = ['random_forest', 'xgboost', 'svm', 'logistic_regression', 'decision_tree']
    
    if not model_metrics or disease not in model_metrics:
        return 'random_forest'
        
    disease_algs = model_metrics[disease]
    best_alg = 'random_forest'
    best_score = (-1.0, -1.0, -1.0) # (f1_score, accuracy, roc_auc)
    
    for alg in algs:
        if alg in disease_algs:
            m = disease_algs[alg]
            f1 = m.get('f1_score', 0.0)
            acc = m.get('accuracy', 0.0)
            auc = m.get('roc_auc', 0.0)
            
            current_score = (f1, acc, auc)
            if current_score > best_score:
                best_score = current_score
                best_alg = alg
            elif current_score == best_score:
                if pref_order.index(alg) < pref_order.index(best_alg):
                    best_alg = alg
                    
    return best_alg

def encode_input(data: dict, bmi: float):
    numericals = [
        float(data.get('age', 35)),
        float(data.get('height', 170)),
        float(data.get('weight', 70)),
        float(bmi),
        float(data.get('sleepDuration', 7)),
        float(data.get('bpSystolic', 120)),
        float(data.get('bpDiastolic', 80)),
        float(data.get('cholesterol', 180)),
        float(data.get('glucose', 90)),
        float(data.get('insulin', 8)),
        float(data.get('heartRate', 70))
    ]
    
    cat_categories = {
        'gender': ['male', 'female', 'other'],
        'smoking': ['yes', 'no'],
        'alcohol': ['low', 'moderate', 'high'],
        'physical_activity': ['sedentary', 'moderate', 'active']
    }
    
    mapped_keys = {
        'gender': str(data.get('gender', 'male')).lower(),
        'smoking': str(data.get('smoking', 'no')).lower(),
        'alcohol': str(data.get('alcohol', 'low')).lower(),
        'physical_activity': str(data.get('physicalActivity', 'moderate')).lower()
    }
    
    categoricals = []
    for col, cats in cat_categories.items():
        val = mapped_keys[col]
        if val not in cats:
            val = cats[0]
        for cat in cats:
            categoricals.append(1.0 if val == cat else 0.0)
            
    all_features = np.array(numericals + categoricals).reshape(1, -1)
    return all_features
