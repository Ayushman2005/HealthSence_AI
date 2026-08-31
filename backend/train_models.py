import os
import glob
from pipeline_trainer import run_training_pipeline
from config import MODELS_DIR

def main():
    print("==================================================")
    print("Executing Standalone ML Training Pipeline...")
    print("==================================================")
    
    metrics = run_training_pipeline()
    
    pkl_files = glob.glob(os.path.join(MODELS_DIR, "heart_disease_*.pkl"))
    print(f"\nTraining summary: Successfully trained {len(pkl_files)} Heart Disease model files in models/ directory.")
    print("All Heart Disease models are ready for FastAPI server deployment.")

if __name__ == "__main__":
    main()
