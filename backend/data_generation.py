import pandas as pd
import numpy as np
import random

def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    random.seed(42)

    # Features
    past_faults = np.random.poisson(lam=1.5, size=num_samples)
    rainfall_mm = np.random.uniform(0, 500, size=num_samples)
    construction_distance_m = np.random.uniform(0, 500, size=num_samples)
    soil_type = [random.choice(['Clay', 'Sandy', 'Rocky', 'Silt']) for _ in range(num_samples)]
    traffic_density = np.random.uniform(0, 100, size=num_samples)
    maintenance_gap_days = np.random.randint(0, 365, size=num_samples)
    
    # Natural Disasters
    cyclone_exposure = np.random.uniform(0, 1.0, size=num_samples)
    flood_risk = np.random.uniform(0, 1.0, size=num_samples)
    heat_stress_index = np.random.uniform(0, 1.0, size=num_samples)
    landslide_risk_index = np.random.uniform(0, 1.0, size=num_samples)

    # GIS coordinates (Sample area in Tamil Nadu for TANFINET context)
    lat_base = 13.0827
    lon_base = 80.2707
    latitudes = lat_base + np.random.uniform(-0.1, 0.1, size=num_samples)
    longitudes = lon_base + np.random.uniform(-0.1, 0.1, size=num_samples)

    # Target variable generation (Logic-based with noise)
    failure_prob = (
        0.2 * (past_faults / 5) +
        0.15 * (rainfall_mm / 500) +
        0.15 * (1 - construction_distance_m / 500) +
        0.1 * (maintenance_gap_days / 365) +
        0.05 * (traffic_density / 100) +
        0.15 * cyclone_exposure +
        0.1 * flood_risk +
        0.05 * heat_stress_index +
        0.05 * landslide_risk_index
    )
    # Add soil impact
    soil_impact = {'Clay': 0.1, 'Sandy': 0.05, 'Rocky': -0.05, 'Silt': 0.0}
    failure_prob += np.array([soil_impact[s] for s in soil_type])
    
    # Clip and convert to binary target
    failure_prob = np.clip(failure_prob, 0, 1)
    failure_next_30_days = (np.random.random(num_samples) < failure_prob).astype(int)

    df = pd.DataFrame({
        'past_faults': past_faults,
        'rainfall_mm': rainfall_mm,
        'construction_distance_m': construction_distance_m,
        'soil_type': soil_type,
        'traffic_density': traffic_density,
        'maintenance_gap_days': maintenance_gap_days,
        'cyclone_exposure': cyclone_exposure,
        'flood_risk': flood_risk,
        'heat_stress_index': heat_stress_index,
        'landslide_risk_index': landslide_risk_index,
        'latitude': latitudes,
        'longitude': longitudes,
        'failure_next_30_days': failure_next_30_days
    })

    df.to_csv('synthetic_fiber_data.csv', index=False)
    print(f"Generated {num_samples} samples and saved to synthetic_fiber_data.csv")

if __name__ == "__main__":
    generate_synthetic_data()
