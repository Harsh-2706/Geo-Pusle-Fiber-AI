import data_generation
import model_training
import map_generation

def main():
    print("--- Phase 1: Data Generation ---")
    data_generation.generate_synthetic_data()
    
    print("\n--- Phase 2: Model Training ---")
    model_training.train_model()
    
    print("\n--- Phase 3: GIS Map Generation ---")
    map_generation.generate_map()
    
    print("\nSystem execution complete. Check fiber_risk_map.html for visualization.")

if __name__ == "__main__":
    main()