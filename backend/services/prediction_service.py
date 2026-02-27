import os
import joblib
import numpy as np
import pandas as pd

# ── Model directory is at /backend/model/ ──────────────────────────────────
_MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model")

def _load():
    model        = joblib.load(os.path.join(_MODEL_DIR, "fiber_model.pkl"))
    encoder      = joblib.load(os.path.join(_MODEL_DIR, "soil_encoder.pkl"))
    feature_names = joblib.load(os.path.join(_MODEL_DIR, "feature_names.pkl"))
    return model, encoder, feature_names

_model, _encoder, _feature_names = _load()


def predict_risk(df: pd.DataFrame) -> pd.DataFrame:
    """
    Accepts the raw synthetic DataFrame (contains string 'soil_type').
    Returns the same DataFrame augmented with:
        risk_score  – float 0-1 failure probability
        risk_level  – "High" | "Moderate" | "Low"
    """
    df = df.copy()

    # Encode soil_type to match training (LabelEncoder was fit on Clay/Rocky/Sandy/Silt)
    df["soil_type"] = _encoder.transform(df["soil_type"])

    # Build feature matrix in the exact training order
    X = df[_feature_names].values

    # Base ML Model Probability
    proba = _model.predict_proba(X)[:, 1]

    # Apply Zone / State-Level Environmental Multipliers
    adjusted_proba = np.copy(proba)
    alerts = [None] * len(df)
    vulnerable = [False] * len(df)
    
    for i in range(len(df)):
        multiplier = 1.0
        row = df.iloc[i]
        z = row.get('zone_type')
        f_type = row.get('fiber_type')
        
        # 1. Base Zone Multipliers
        if z == 'Coastal':
            if row.get('cyclone_exposure', 0) > 0.8: multiplier += 0.20
            if row.get('flood_risk', 0) > 0.5: multiplier += 0.10
        elif z == 'Delta':
            if row.get('flood_risk', 0) > 0.8: multiplier += 0.15
            if row.get('groundwater', 0) > 0.8: multiplier += 0.10
        elif z == 'Urban Metro':
            if row.get('construction_proximity_km', 1.0) < 0.5: multiplier += 0.15
            if row.get('traffic_congestion_index', 0) > 0.8: multiplier += 0.05
        elif z == 'Dry Interior':
            if row.get('heat_stress_index', 0) > 0.8: multiplier += 0.10
            if row.get('soil_shrinkage', 0) > 0.5: multiplier += 0.10
        elif z == 'Hill Region':
            if row.get('landslide_risk_index', 0) > 0.8: multiplier += 0.25
            if row.get('terrain_instability_index', 0) > 0.8: multiplier += 0.15

        # 2. Fiber Type Sensitivity (Aerial)
        if f_type == "Aerial":
            if row.get('wind_speed', 0) > 50: multiplier += 0.20
            if row.get('traffic_congestion_index', 0) > 0.7: multiplier += 0.10
            if row.get('construction_proximity_km', 1.0) < 0.3: multiplier += 0.15
            if row.get('signal_degradation_rate', 0) > 0.2: multiplier += 0.10

        # 3. Rural Vandalism / Crowd Risk
        if z in ["Delta", "Dry Interior"] and row.get('crowd_intensity_index', 0) > 0.7:
            multiplier += 0.15 # Vandalism risk

        # 4. Alert Logic
        if row.get('construction_proximity_km', 1.0) < 0.5:
            alerts[i] = "Construction Alert"
        elif row.get('accident_density_index', 0) > 0.8:
            alerts[i] = "Traffic Damage Alert"
        elif row.get('signal_degradation_rate', 0) > 0.3:
            alerts[i] = "Fiber Health Alert"
            
        final_p = adjusted_proba[i] * multiplier
        adjusted_proba[i] = min(final_p, 1.0) # Clamp to 1.0

    df["risk_score"] = np.round(adjusted_proba, 4).tolist()
    df["risk_level"] = [
        "High"     if p >= 0.60 else
        "Moderate" if p >= 0.35 else
        "Low"
        for p in adjusted_proba
    ]
    
    # Ensure alerts are strings or None (for JSON null)
    df["alert_type"] = alerts

    # 5. Vulnerability Propagation (Geometric/Proximity check)
    critical_indices = [idx for idx, p in enumerate(adjusted_proba) if p > 0.85]
    for c_idx in critical_indices:
        c_lat = df.iloc[c_idx]["latitude"]
        c_lon = df.iloc[c_idx]["longitude"]
        c_zone = df.iloc[c_idx]["zone_type"]
        
        # Vectorized proximity check for speed and safety
        dists = np.sqrt((df["latitude"] - c_lat)**2 + (df["longitude"] - c_lon)**2)
        zone_mask = (df["zone_type"] == c_zone)
        near_mask = (dists < 0.15) & zone_mask
        vulnerable = [v or n for v, n in zip(vulnerable, near_mask)]
    
    df["vulnerability_flag"] = [bool(v) for v in vulnerable]

    # 6. Operational Scores
    # Use .notna() or direct list check for technician_required
    df["technician_required"] = [
        (lvl == "High" or alert is not None)
        for lvl, alert in zip(df["risk_level"], df["alert_type"])
    ]
    
    priority = []
    for i in range(len(df)):
        r = df.iloc[i]
        # Ensure no NaNs in calculation
        base = float(r["risk_score"]) * 70
        dist = float(r.get("technician_distance_km", 25))
        avail = float(r.get("technician_availability_score", 0.5))
        
        dist_factor = (1 - (min(dist, 50) / 50)) * 15
        avail_factor = avail * 15
        
        score = base + dist_factor + avail_factor
        priority.append(float(np.round(score, 1)))
        
    df["dispatch_priority_score"] = priority

    # Final guard against NaN
    df = df.fillna(0)

    # 7. Technician Assignment Logic
    from services.technician_service import get_nearest_technician, reset_assignments

    # Reset a portion of assignments to simulate a live environment
    reset_assignments()

    assigned_tech_ids = [None] * len(df)
    assigned_tech_names = [None] * len(df)
    assigned_tech_contacts = [None] * len(df)
    assigned_tech_exp = [None] * len(df)
    etas = [None] * len(df)
    statuses = ["Idle"] * len(df)

    for i in range(len(df)):
        risk = df.iloc[i]["risk_score"]
        # LOWERED THRESHOLD TO 0.7 AS REQUESTED
        if risk >= 0.7:
            row = df.iloc[i]
            tech, dist = get_nearest_technician(
                row["latitude"], 
                row["longitude"], 
                row["fiber_type"], 
                row["zone_type"],
                row["segment_id"]
            )
            
            if tech:
                assigned_tech_ids[i] = tech.id
                assigned_tech_names[i] = tech.name
                assigned_tech_contacts[i] = tech.contact
                assigned_tech_exp[i] = f"{tech.experience_years} years"
                # 1 degree is roughly 111km. Simple Euclidean dist * 111
                km_dist = dist * 111
                # ETA in minutes (avg 30km/h travel speed)
                etas[i] = int(km_dist * 2) 
                statuses[i] = "Dispatched"
            else:
                statuses[i] = "Pending Assignment (Fleet Busy)"

    df["assigned_technician_id"] = assigned_tech_ids
    df["assigned_technician_name"] = assigned_tech_names
    df["assigned_technician_contact"] = assigned_tech_contacts
    df["assigned_technician_experience"] = assigned_tech_exp
    df["estimated_arrival_time"] = etas
    df["dispatch_status"] = statuses

    # Final guard against NaN and non-JSON compliant values
    # Replace NaN with 0 for numeric and None for objects
    df = df.replace({np.nan: None})
    
    return df
