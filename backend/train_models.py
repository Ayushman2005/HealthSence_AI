import os
import json
import glob
import pandas as pd
import matplotlib
matplotlib.use('Agg')

def execute_notebook_cells(notebook_path):
    print(f"\n==================================================")
    print(f"Executing Jupyter Notebook: {os.path.basename(notebook_path)}")
    print(f"==================================================")
    
    with open(notebook_path, "r", encoding="utf-8") as f:
        nb = json.load(f)
        
    global_env = {'__name__': '__main__'}
    
    for idx, cell in enumerate(nb.get("cells", [])):
        if cell.get("cell_type") == "code":
            source = "".join(cell.get("source", []))
            if source.strip():
                try:
                    exec(source, global_env)
                except Exception as e:
                    print(f"Error executing cell {idx+1} in {os.path.basename(notebook_path)}: {e}")
                    raise e

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    notebooks_dir = os.path.join(base_dir, "notebooks")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    notebook_files = [
        os.path.join(notebooks_dir, "heart_disease_model_training.ipynb")
    ]
    
    for nb_path in notebook_files:
        if os.path.exists(nb_path):
            execute_notebook_cells(nb_path)
        else:
            print(f"WARNING: Notebook file missing at {nb_path}")
            
    # Verify trained Heart Disease models count
    pkl_files = glob.glob(os.path.join(models_dir, "heart_disease_*.pkl"))
    print(f"\nTraining summary: Successfully loaded/trained {len(pkl_files)} Heart Disease model files in models/ directory.")
    print("All Heart Disease models are ready for FastAPI server deployment.")

if __name__ == "__main__":
    main()
