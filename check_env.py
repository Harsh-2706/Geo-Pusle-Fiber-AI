import sys
import os
import subprocess

def check_environment():
    print("--- TANFINET Environment Diagnostic ---")
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    
    # Check for crucial packages
    packages = ["fastapi", "uvicorn", "pandas", "numpy", "sklearn", "joblib"]
    print("\nChecking dependencies:")
    for pkg in packages:
        try:
            __import__(pkg)
            print(f"[OK] {pkg}")
        except ImportError:
            print(f"[MISSING] {pkg}")

    # Check for model files
    backend_path = os.path.join(os.getcwd(), "backend")
    model_path = os.path.join(backend_path, "model")
    models = ["fiber_model.pkl", "soil_encoder.pkl", "feature_names.pkl"]
    
    print(f"\nChecking models in {model_path}:")
    if os.path.exists(model_path):
        for m in models:
            path = os.path.join(model_path, m)
            if os.path.exists(path):
                print(f"[OK] {m} (Size: {os.path.getsize(path)} bytes)")
            else:
                print(f"[MISSING] {m}")
    else:
        print(f"[ERROR] Model directory not found at {model_path}")

    print("\nSummary: If all dependencies and models are [OK], your environment is ready.")
    print("If VS Code still shows 'Loading', try 'Ctrl+Shift+P' -> 'Python: Restart Language Server'.")

if __name__ == "__main__":
    check_environment()
