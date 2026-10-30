import os
import glob
from pipeline_trainer import run_training_pipeline
from config import MODELS_DIR

def main():
    print("==================================================")
    print("Executing Standalone ML Training Pipeline...")
    print("==================================================")
    
    metrics = run_training_pipeline()
    
    hd_pkl_files = glob.glob(os.path.join(MODELS_DIR, "heart_disease_*.pkl"))
    db_pkl_files = glob.glob(os.path.join(MODELS_DIR, "diabetes_*.pkl"))
    print(f"\nTraining summary:")
    print(f"  - Heart Disease: Successfully trained {len(hd_pkl_files)} models.")
    print(f"  - Type 2 Diabetes: Successfully trained {len(db_pkl_files)} models.")
    print(f"Total {len(hd_pkl_files) + len(db_pkl_files)} models ready in models/ directory for FastAPI deployment.")

if __name__ == "__main__":
    main()
