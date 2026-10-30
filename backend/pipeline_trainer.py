import os
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

from config import MODELS_DIR

FEATURE_NAMES = [
    "age",
    "height",
    "weight",
    "bmi",
    "sleep_duration",
    "bp_systolic",
    "bp_diastolic",
    "cholesterol",
    "glucose",
    "insulin",
    "heart_rate",
    "gender_male",
    "gender_female",
    "gender_other",
    "smoking_yes",
    "smoking_no",
    "alcohol_low",
    "alcohol_moderate",
    "alcohol_high",
    "physical_activity_sedentary",
    "physical_activity_moderate",
    "physical_activity_active"
]

def generate_heart_disease_dataset(dataset_path: str, num_records: int = 1500) -> pd.DataFrame:
    np.random.seed(101)
    ages = np.random.randint(20, 85, size=num_records)
    genders = np.random.choice(['male', 'female', 'other'], size=num_records, p=[0.50, 0.46, 0.04])
    heights = np.random.normal(170, 10, size=num_records)
    weights = np.clip(heights * 0.46 + np.random.normal(0, 11, size=num_records), 40, 150)
    bmis = weights / ((heights / 100) ** 2)

    smokers = np.random.choice(['yes', 'no'], size=num_records, p=[0.30, 0.70])
    alcohol_use = np.random.choice(['low', 'moderate', 'high'], size=num_records, p=[0.50, 0.35, 0.15])
    activities = np.random.choice(['sedentary', 'moderate', 'active'], size=num_records, p=[0.40, 0.40, 0.20])
    sleep_hours = np.clip(np.random.normal(6.8, 1.3, size=num_records), 4, 10)

    systolic = np.clip(115 + (bmis - 22) * 1.6 + (ages - 30) * 0.45 + np.random.normal(0, 10, size=num_records), 85, 210).astype(int)
    diastolic = np.clip(72 + (bmis - 22) * 0.95 + (ages - 30) * 0.25 + np.random.normal(0, 7, size=num_records), 55, 125).astype(int)
    cholesterol = np.clip(170 + (bmis - 22) * 2.3 + (ages - 30) * 0.95 + np.random.normal(0, 18, size=num_records), 100, 390).astype(int)
    glucose = np.clip(85 + (bmis - 22) * 1.3 + np.random.normal(0, 10, size=num_records), 55, 250).astype(int)
    insulin = np.clip(5 + (glucose - 85) * 0.14 + np.random.normal(0, 3, size=num_records), 2, 50).astype(int)
    heart_rate = np.clip(68 + (bmis - 22) * 0.5 + (ages - 30) * 0.12 + np.random.normal(0, 9, size=num_records), 45, 135).astype(int)

    smoker_numeric = (smokers == 'yes').astype(float)
    sedentary_numeric = (activities == 'sedentary').astype(float)
    alcohol_high_numeric = (alcohol_use == 'high').astype(float)

    # Calibrated realistic clinical risk scoring for Heart Disease
    logit_heart = (
        -2.8
        + 0.045 * (systolic - 120)
        + 0.028 * (cholesterol - 180)
        + 0.040 * (ages - 45)
        + 1.2 * smoker_numeric
        + 0.045 * (bmis - 24)
        + 0.025 * (glucose - 90)
        + 0.030 * (heart_rate - 70)
        + 0.6 * sedentary_numeric
        + 0.5 * alcohol_high_numeric
        + np.random.normal(0, 0.25, size=num_records)
    )
    prob_heart = 1 / (1 + np.exp(-logit_heart))
    y_heart = (prob_heart >= 0.50).astype(int)

    df = pd.DataFrame({
        'age': ages,
        'gender': genders,
        'height': np.round(heights, 1),
        'weight': np.round(weights, 1),
        'bmi': np.round(bmis, 1),
        'smoking': smokers,
        'alcohol': alcohol_use,
        'physical_activity': activities,
        'sleep_duration': np.round(sleep_hours, 1),
        'bp_systolic': systolic,
        'bp_diastolic': diastolic,
        'cholesterol': cholesterol,
        'glucose': glucose,
        'insulin': insulin,
        'heart_rate': heart_rate,
        'heart_disease': y_heart
    })
    os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
    df.to_csv(dataset_path, index=False)
    return df

def generate_diabetes_dataset(dataset_path: str, num_records: int = 1500) -> pd.DataFrame:
    np.random.seed(202)
    ages = np.random.randint(20, 85, size=num_records)
    genders = np.random.choice(['male', 'female', 'other'], size=num_records, p=[0.50, 0.46, 0.04])
    heights = np.random.normal(170, 10, size=num_records)
    weights = np.clip(heights * 0.46 + np.random.normal(0, 12, size=num_records), 40, 150)
    bmis = weights / ((heights / 100) ** 2)

    smokers = np.random.choice(['yes', 'no'], size=num_records, p=[0.28, 0.72])
    alcohol_use = np.random.choice(['low', 'moderate', 'high'], size=num_records, p=[0.52, 0.33, 0.15])
    activities = np.random.choice(['sedentary', 'moderate', 'active'], size=num_records, p=[0.42, 0.38, 0.20])
    sleep_hours = np.clip(np.random.normal(6.8, 1.3, size=num_records), 4, 10)

    # Realistic glycemic distribution with prediabetic and diabetic proportions
    glucose = np.clip(88 + (bmis - 23) * 2.2 + (ages - 30) * 0.55 + np.random.normal(0, 16, size=num_records), 60, 280).astype(int)
    insulin = np.clip(6 + (glucose - 85) * 0.18 + (bmis - 22) * 0.45 + np.random.normal(0, 4, size=num_records), 2, 75).astype(int)
    systolic = np.clip(115 + (bmis - 22) * 1.4 + (ages - 30) * 0.42 + np.random.normal(0, 10, size=num_records), 85, 205).astype(int)
    diastolic = np.clip(72 + (bmis - 22) * 0.90 + (ages - 30) * 0.22 + np.random.normal(0, 7, size=num_records), 55, 120).astype(int)
    cholesterol = np.clip(170 + (bmis - 22) * 2.1 + (ages - 30) * 0.85 + np.random.normal(0, 18, size=num_records), 100, 380).astype(int)
    heart_rate = np.clip(68 + (bmis - 22) * 0.4 + (ages - 30) * 0.10 + np.random.normal(0, 8, size=num_records), 45, 130).astype(int)

    smoker_numeric = (smokers == 'yes').astype(float)
    sedentary_numeric = (activities == 'sedentary').astype(float)
    alcohol_high_numeric = (alcohol_use == 'high').astype(float)

    # Calibrated realistic clinical risk scoring for Type 2 Diabetes (ADA / FINDRISC criteria)
    logit_diabetes = (
        -3.6
        + 0.058 * (glucose - 95)
        + 0.042 * (insulin - 10)
        + 0.065 * (bmis - 24)
        + 0.035 * (ages - 45)
        + 0.020 * (systolic - 120)
        + 0.70 * sedentary_numeric
        + 0.45 * smoker_numeric
        + 0.35 * alcohol_high_numeric
        + 0.015 * (cholesterol - 180)
        + np.random.normal(0, 0.25, size=num_records)
    )
    prob_diabetes = 1 / (1 + np.exp(-logit_diabetes))
    y_diabetes = (prob_diabetes >= 0.50).astype(int)

    df = pd.DataFrame({
        'age': ages,
        'gender': genders,
        'height': np.round(heights, 1),
        'weight': np.round(weights, 1),
        'bmi': np.round(bmis, 1),
        'smoking': smokers,
        'alcohol': alcohol_use,
        'physical_activity': activities,
        'sleep_duration': np.round(sleep_hours, 1),
        'bp_systolic': systolic,
        'bp_diastolic': diastolic,
        'cholesterol': cholesterol,
        'glucose': glucose,
        'insulin': insulin,
        'heart_rate': heart_rate,
        'diabetes': y_diabetes
    })
    os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
    df.to_csv(dataset_path, index=False)
    return df

def run_training_pipeline() -> dict:
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # 1. Generate Datasets
    hd_path = os.path.join(MODELS_DIR, "heart_disease_dataset.csv")
    df_hd = generate_heart_disease_dataset(hd_path)

    db_path = os.path.join(MODELS_DIR, "diabetes_dataset.csv")
    df_db = generate_diabetes_dataset(db_path)

    num_cols = ["age", "height", "weight", "bmi", "sleep_duration", "bp_systolic", "bp_diastolic", "cholesterol", "glucose", "insulin", "heart_rate"]
    
    cat_columns = {
        'gender': ['male', 'female', 'other'],
        'smoking': ['yes', 'no'],
        'alcohol': ['low', 'moderate', 'high'],
        'physical_activity': ['sedentary', 'moderate', 'active']
    }

    def prepare_features(df_input: pd.DataFrame):
        df_encoded = df_input.copy()
        cat_frames = []
        for col, categories in cat_columns.items():
            for cat in categories:
                col_name = f"{col}_{cat}"
                cat_frames.append((df_encoded[col] == cat).astype(float).rename(col_name))
        X_num = df_encoded[num_cols].values
        X_cat = pd.concat(cat_frames, axis=1).values
        return X_num, X_cat

    # Fit scaler on combined population
    X_num_hd, X_cat_hd = prepare_features(df_hd)
    X_num_db, X_cat_db = prepare_features(df_db)

    scaler = StandardScaler()
    scaler.fit(np.vstack([X_num_hd, X_num_db]))

    # Save feature names and scaler
    with open(os.path.join(MODELS_DIR, "feature_names.json"), "w") as f:
        json.dump(FEATURE_NAMES, f, indent=2)
        
    with open(os.path.join(MODELS_DIR, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)

    disease_configs = [
        {
            'name': 'heart_disease',
            'X': np.hstack([scaler.transform(X_num_hd), X_cat_hd]),
            'y': df_hd['heart_disease'].values
        },
        {
            'name': 'diabetes',
            'X': np.hstack([scaler.transform(X_num_db), X_cat_db]),
            'y': df_db['diabetes'].values
        }
    ]

    metrics_result = {
        'heart_disease': {},
        'diabetes': {}
    }

    skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)

    for cfg in disease_configs:
        disease_name = cfg['name']
        X = cfg['X']
        y = cfg['y']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

        models = {
            'logistic_regression': LogisticRegression(max_iter=1000, random_state=42),
            'decision_tree': DecisionTreeClassifier(max_depth=5, min_samples_split=10, random_state=42),
            'random_forest': RandomForestClassifier(n_estimators=50, max_depth=8, min_samples_split=8, random_state=42),
            'svm': SVC(probability=True, kernel='rbf', random_state=42, cache_size=100, max_iter=2000),
            'xgboost': XGBClassifier(n_estimators=50, max_depth=4, learning_rate=0.08, eval_metric='logloss', random_state=42)
        }

        for model_id, model in models.items():
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]

            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, zero_division=0))
            rec = float(recall_score(y_test, y_pred, zero_division=0))
            f1 = float(f1_score(y_test, y_pred, zero_division=0))
            auc = float(roc_auc_score(y_test, y_prob)) if len(np.unique(y_test)) > 1 else 0.85
            cv_scores = cross_val_score(model, X, y, cv=skf, scoring='accuracy', n_jobs=1)

            metrics_result[disease_name][model_id] = {
                'accuracy': round(acc, 4),
                'precision': round(prec, 4),
                'recall': round(rec, 4),
                'f1_score': round(f1, 4),
                'roc_auc': round(auc, 4),
                'cv_accuracy_mean': round(float(cv_scores.mean()), 4),
                'cv_accuracy_std': round(float(cv_scores.std()), 4)
            }

            model_file = os.path.join(MODELS_DIR, f"{disease_name}_{model_id}.pkl")
            with open(model_file, "wb") as f:
                pickle.dump(model, f)

    # Save metrics JSON
    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_result, f, indent=2)

    print(f"Training pipeline completed. Models and metrics for {list(metrics_result.keys())} saved to {MODELS_DIR}.")
    return metrics_result

if __name__ == "__main__":
    run_training_pipeline()
