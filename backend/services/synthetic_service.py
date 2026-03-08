import pandas as pd
import numpy as np
import random
from services.weather_service import fetch_real_weather_data
from services.disaster_service import fetch_disasters
from services.earthquake_service import fetch_earthquakes
from services.crowd_service import calculate_crowd_intelligence_for_segment
import math

def haversine(lat1, lon1, lat2, lon2):
    """Calculates distance between two points on Earth in km."""
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# Global flag for hybrid data mode
HYBRID_DATA_MODE = True

# ---------------------------------------------------------------------------
# Tamil Nadu Zones mapping.
# ---------------------------------------------------------------------------
_TN_ZONES = {
    "Coastal": [
        ("Chennai", 13.0827, 80.2707),
        ("Kanyakumari", 8.0883, 77.5385),
        ("Nagapattinam", 10.7656, 79.8424)
    ],
    "Delta": [
        ("Thanjavur", 10.7870, 79.1378),
        ("Tiruvarur", 10.7661, 79.6344),
        ("Mayiladuthurai", 11.1085, 79.6534)
    ],
    "Urban Metro": [
        ("Chennai Metro", 13.0500, 80.2000), # slightly distinct from general coastal
        ("Coimbatore", 11.0168, 76.9558),
        ("Madurai", 9.9252, 78.1198)
    ],
    "Dry Interior": [
        ("Dharmapuri", 12.1211, 78.1582),
        ("Ramanathapuram", 9.3639, 78.8320),
        ("Sivaganga", 9.8433, 78.4809)
    ],
    "Hill Region": [
        ("Nilgiris", 11.4916, 76.7337),
        ("Kodaikanal", 10.2381, 77.4892),
        ("Yercaud", 11.7753, 78.2093)
    ]
}

_OFFSET = 0.04  # degrees (~4.5 km) — keeps points well within land


def generate_synthetic_data(n: int = 50) -> pd.DataFrame:
    """
    Generates n random fiber-segment rows with Tamil Nadu district-level classification.

    ML feature columns match those in feature_names.pkl:
        past_faults, rainfall_mm, construction_distance_m,
        soil_type, traffic_density, maintenance_gap_days
    With added TN regional features.
    """
    past_faults             = np.random.poisson(lam=1.5, size=n)
    rainfall_mm             = np.random.uniform(0, 500, size=n)
    construction_distance_m = np.random.uniform(0, 500, size=n)
    soil_type               = [random.choice(["Clay", "Sandy", "Rocky", "Silt"]) for _ in range(n)]
    traffic_density         = np.random.uniform(0, 100, size=n)
    maintenance_gap_days    = np.random.randint(0, 365, size=n)

    zones_list = list(_TN_ZONES.keys())
    
    latitudes = []
    longitudes = []
    
    # Generate initial locations
    for i in range(n):
        z = random.choice(zones_list)
        _, d_lat, d_lon = random.choice(_TN_ZONES[z])
        latitudes.append(d_lat + random.uniform(-_OFFSET, _OFFSET))
        longitudes.append(d_lon + random.uniform(-_OFFSET, _OFFSET))

    # Fetch Real-Time Weather if Hybrid Mode is Active
    real_weather = None
    if HYBRID_DATA_MODE:
        real_weather = fetch_real_weather_data(latitudes, longitudes)
    
    # Fetch Real-Time Disaster Events
    disaster_events = fetch_disasters() if HYBRID_DATA_MODE else []
    earthquake_events = fetch_earthquakes() if HYBRID_DATA_MODE else []

    # Initial lists for data collection
    districts = []
    zone_types = []
    
    # New Environmentals
    cyclone_exposure = []
    flood_risk = []
    groundwater = []
    heat_stress_index = []
    soil_shrinkage = []
    landslide_risk_index = []
    terrain_instability_index = []

    # New Request Factors
    accident_rate_index = []
    construction_activity_index = []
    highway_density_index = []
    telecom_civil_work_index = []
    
    accident_density_index = []
    traffic_congestion_index = []
    construction_proximity_km = []
    crowd_intensity_index = []
    fiber_types = []
    signal_degradation_rate = []
    physical_strain_index = []
    cable_height_m = []
    wind_speed = np.random.uniform(0, 40, size=n).tolist()
    technician_distance_km = []
    technician_availability_score = []
    
    # Hybrid & Engineered metadata
    engineered_wind_risk = []
    engineered_rain_impact = []
    engineered_soil_instab = []
    engineered_aerial_exp = []
    is_real_data = [] # Combined hybrid status

    # Disaster features
    disaster_proximity_km = []
    disaster_severity_weight = []
    earthquake_magnitude = []
    earthquake_distance_km = []
    composite_disaster_index = []
    disaster_alert_reason = []
    
    # Crowd Intelligence Features
    nearest_festival_name = []
    festival_proximity_km = []

    for i in range(n):
        z = random.choice(zones_list)
        d_name, d_lat, d_lon = random.choice(_TN_ZONES[z])
        
        zone_types.append(z)
        districts.append(d_name)
        
        # Use pre-generated coordinates
        lat = latitudes[i]
        lon = longitudes[i]
        
        # Base environmental defaults
        c_exp, f_risk, g_water = 0.0, 0.0, 0.0
        h_stress, s_shrink, l_risk, t_instab = 0.0, 0.0, 0.0, 0.0
        
        # Request Factors Defaults
        f_type = random.choice(["Aerial", "Underground"])
        acc_rate = random.uniform(0.05, 0.2)
        const_act = random.uniform(0.05, 0.2)
        hwy_dens = random.uniform(0.1, 0.2)
        tel_work = random.uniform(0.05, 0.2)
        
        acc_idx = random.uniform(0.05, 0.2)
        traf_cong = random.uniform(0.1, 0.3)
        const_prox = random.uniform(1.0, 10.0)
        sig_degrad = random.uniform(0.01, 0.1)

        # Real-time Crowd Intelligence
        crowd_data = calculate_crowd_intelligence_for_segment(lat, lon)
        crowd_idx = crowd_data["crowd_intensity_index"]
        fest_name = crowd_data["nearest_festival_name"]
        fest_prox = crowd_data["festival_proximity_km"]
        phys_strain = random.uniform(0.1, 0.4)
        c_height = 0.0 if f_type == "Underground" else random.uniform(5.0, 8.0)
        tech_dist = random.uniform(1.0, 50.0)
        tech_avail = random.uniform(0.5, 1.0)

        # Overwrite with Real Data if available
        is_hybrid = False
        if real_weather:
            try:
                rainfall_mm[i] = real_weather["precipitation"][i]
                wind_speed[i] = real_weather["wind_speed_10m"][i]
                # Store extra real data context
                temp = real_weather["temperature_2m"][i]
                soil_0 = real_weather["soil_moisture_0_1cm"][i]
                soil_3 = real_weather["soil_moisture_3_9cm"][i]
                is_hybrid = True
            except (KeyError, IndexError):
                pass
        
        # New Engineered Features
        # wind_risk_score proportional to wind speed and gusts
        w_risk = (wind_speed[i] / 50.0) if is_hybrid else (wind_speed[i] / 40.0)
        
        # rainfall_impact_score based on precipitation
        r_impact = (rainfall_mm[i] / 100.0) if is_hybrid else (rainfall_mm[i] / 500.0)
        
        # soil_instability_index based on moisture if available
        if is_hybrid:
            s_instab = (real_weather["soil_moisture_0_1cm"][i] + real_weather["soil_moisture_3_9cm"][i]) / 2.0
        else:
            s_instab = random.uniform(0.1, 0.4)
            
        # aerial_exposure_factor (Aerial lines at higher risk)
        a_exp = 0.8 if f_type == "Aerial" else 0.1
        a_exp += (w_risk * 0.2) # Wind increases aerial risk

        # Disaster & Earthquake Risk Integration
        d_prox = 999.0
        d_weight = 0.0
        d_reason = ""
        
        for d in disaster_events:
            dist = haversine(lat, lon, d["lat"], d["lon"])
            if dist < d_prox:
                d_prox = dist
                d_reason = f"{d['type']} ({d['title']})"
        
        # Earthquake logic
        eq_dist = 999.0
        eq_mag = 0.0
        for eq in earthquake_events:
            dist = haversine(lat, lon, eq["lat"], eq["lon"])
            if dist < eq_dist:
                eq_dist = dist
                eq_mag = eq["mag"]
        
        # Scaling weights
        if d_prox < 50: d_weight = 1.0 - (d_prox / 50.0)
        eq_weight = 0.0
        if eq_mag >= 4.0 and eq_dist < 100:
            eq_weight = (eq_mag / 10.0) * (1.0 - (eq_dist / 100.0))
            
        c_disaster_idx = max(d_weight, eq_weight)
        
        disaster_proximity_km.append(round(d_prox, 2))
        disaster_severity_weight.append(round(d_weight, 2))
        earthquake_magnitude.append(round(eq_mag, 1))
        earthquake_distance_km.append(round(eq_dist, 2))
        composite_disaster_index.append(round(c_disaster_idx, 2))
        disaster_alert_reason.append(d_reason)

        # Apply zone specific properties requested by user (Tuned down)
        if z == "Coastal":
            c_exp = random.uniform(0.3, 0.6)
            f_risk = random.uniform(0.2, 0.4)
            wind_speed[i] = random.uniform(20, 50)
            tel_work = random.uniform(0.1, 0.4)
        elif z == "Delta":
            f_risk = random.uniform(0.4, 0.7)
            g_water = random.uniform(0.5, 0.8)
            s_shrink = random.uniform(0.3, 0.6)
        elif z == "Urban Metro":
            construction_distance_m[i] = random.uniform(50, 200) 
            const_prox = random.uniform(0.5, 2.0)
            const_act = random.uniform(0.3, 0.6)
            traffic_density[i] = random.uniform(60, 80)
            traf_cong = random.uniform(0.4, 0.7)
            acc_idx = random.uniform(0.3, 0.6)
            acc_rate = random.uniform(0.3, 0.6)
            hwy_dens = random.uniform(0.4, 0.7)
        elif z == "Dry Interior":
            h_stress = random.uniform(0.5, 0.8)
            s_shrink = random.uniform(0.3, 0.5)
        elif z == "Hill Region":
            l_risk = random.uniform(0.4, 0.7)
            t_instab = random.uniform(0.4, 0.7)
            wind_speed[i] = random.uniform(15, 40)
            
        # Specific crowd intensity for rural/delta events
        if z in ["Delta", "Dry Interior"]:
            crowd_idx = random.uniform(0.5, 0.9) if random.random() > 0.7 else crowd_idx

        cyclone_exposure.append(c_exp)
        flood_risk.append(f_risk)
        groundwater.append(g_water)
        heat_stress_index.append(h_stress)
        soil_shrinkage.append(s_shrink)
        landslide_risk_index.append(l_risk)
        terrain_instability_index.append(t_instab)

        accident_rate_index.append(acc_rate)
        construction_activity_index.append(const_act)
        highway_density_index.append(hwy_dens)
        telecom_civil_work_index.append(tel_work)

        accident_density_index.append(acc_idx)
        traffic_congestion_index.append(traf_cong)
        construction_proximity_km.append(const_prox)
        crowd_intensity_index.append(crowd_idx)
        nearest_festival_name.append(fest_name)
        festival_proximity_km.append(fest_prox)
        fiber_types.append(f_type)
        signal_degradation_rate.append(sig_degrad)
        physical_strain_index.append(phys_strain)
        cable_height_m.append(c_height)
        technician_distance_km.append(tech_dist)
        technician_availability_score.append(tech_avail)
        
        # Add engineered features
        engineered_wind_risk.append(w_risk)
        engineered_rain_impact.append(r_impact)
        engineered_soil_instab.append(s_instab)
        engineered_aerial_exp.append(a_exp)
        
        # Mark as Real Data if weather was fetched OR a disaster event was processed
        # Note: disaster_events/earthquake_events are fetched at the start of generate_synthetic_data
        has_real_context = is_hybrid or len(disaster_events) > 0 or len(earthquake_events) > 0
        is_real_data.append(has_real_context)

    return pd.DataFrame({
        "segment_id":              [f"SEG-{i:03d}" for i in range(n)],
        "district":                districts,
        "zone_type":               zone_types,
        "past_faults":             past_faults.tolist(),
        "rainfall_mm":             np.round(rainfall_mm, 2).tolist(),
        "construction_distance_m": np.round(construction_distance_m, 2).tolist(),
        "soil_type":               soil_type,
        "traffic_density":         np.round(traffic_density, 2).tolist(),
        "maintenance_gap_days":    maintenance_gap_days.tolist(),
        "latitude":                np.round(latitudes, 6).tolist(),
        "longitude":               np.round(longitudes, 6).tolist(),
        "cyclone_exposure":        np.round(cyclone_exposure, 2).tolist(),
        "flood_risk":              np.round(flood_risk, 2).tolist(),
        "groundwater":             np.round(groundwater, 2).tolist(),
        "heat_stress_index":       np.round(heat_stress_index, 2).tolist(),
        "soil_shrinkage":          np.round(soil_shrinkage, 2).tolist(),
        "landslide_risk_index":    np.round(landslide_risk_index, 2).tolist(),
        "terrain_instability_index": np.round(terrain_instability_index, 2).tolist(),
        "accident_rate_index": np.round(accident_rate_index, 2).tolist(),
        "construction_activity_index": np.round(construction_activity_index, 2).tolist(),
        "highway_density_index": np.round(highway_density_index, 2).tolist(),
        "telecom_civil_work_index": np.round(telecom_civil_work_index, 2).tolist(),
        "accident_density_index":  np.round(accident_density_index, 2).tolist(),
        "traffic_congestion_index": np.round(traffic_congestion_index, 2).tolist(),
        "construction_proximity_km": np.round(construction_proximity_km, 2).tolist(),
        "crowd_intensity_index":   np.round(crowd_intensity_index, 2).tolist(),
        "fiber_type":              fiber_types,
        "signal_degradation_rate": np.round(signal_degradation_rate, 2).tolist(),
        "physical_strain_index":   np.round(physical_strain_index, 2).tolist(),
        "cable_height_m":          np.round(cable_height_m, 2).tolist(),
        "wind_speed":              np.round(wind_speed, 2).tolist(),
        "technician_distance_km":  np.round(technician_distance_km, 2).tolist(),
        "technician_availability_score": np.round(technician_availability_score, 2).tolist(),
        
        # Hybrid Metadata & Engineered Features
        "wind_risk_score": np.round(engineered_wind_risk, 2).tolist(),
        "rainfall_impact_score": np.round(engineered_rain_impact, 2).tolist(),
        "soil_instability_index": np.round(engineered_soil_instab, 2).tolist(),
        "aerial_exposure_factor": np.round(engineered_aerial_exp, 2).tolist(),
        "is_hybrid_mode": is_real_data,
        "is_real_weather": is_real_data, # Helper for frontend labeling
        
        # Disaster Intelligence Features
        "disaster_proximity_km": disaster_proximity_km,
        "disaster_severity_weight": disaster_severity_weight,
        "earthquake_magnitude": earthquake_magnitude,
        "earthquake_distance_km": earthquake_distance_km,
        "composite_disaster_index": composite_disaster_index,
        "disaster_alert_reason": disaster_alert_reason,
        
        # Crowd Intelligence Features
        "nearest_festival_name": nearest_festival_name,
        "festival_proximity_km": festival_proximity_km
    })

def generate_notifications(df: pd.DataFrame) -> list:
    """
    Generates notification objects based on risk and environmental factors.
    """
    notifications = []
    
    for _, row in df.iterrows():
        risk_score = row.get("risk_score", 0)
        
        # Severity mapping
        if risk_score > 0.9:
            severity = "CRITICAL"
        elif risk_score > 0.75:
            severity = "HIGH"
        elif risk_score > 0.6:
            severity = "MEDIUM"
        else:
            continue
            
        alert_type = "Fiber Health Degradation"
        reason_text = "Progressive signal attenuation detected."
        
        # Factor based overrides
        if row.get("rainfall_mm", 0) > 400:
            alert_type = "Flood Alert"
            reason_text = "Extreme rainfall detected in vicinity."
        elif row.get("cyclone_exposure", 0) > 0.8:
            alert_type = "Cyclone Alert"
            reason_text = "High cyclone trajectory probability."
        elif row.get("construction_proximity_km", 5) < 0.2 and row.get("construction_activity_index", 0) > 0.8:
            alert_type = "Construction Proximity"
            reason_text = "Heavy excavation activity within 200m."
        elif row.get("accident_rate_index", 0) > 0.9:
            alert_type = "Accident Risk"
            reason_text = "High traffic fatality zone; possible cable snag."
        elif row.get("fiber_type") == "Aerial" and row.get("wind_speed", 0) > 70:
            alert_type = "Aerial Structural Risk"
            reason_text = "Extreme wind strain on aerial spans."
        
        # New Disaster Overrides
        if row.get("composite_disaster_index", 0) > 0.5:
            alert_type = "Statewide Disaster Alert"
            eq_mag = row.get("earthquake_magnitude", 0)
            eq_dist = row.get("earthquake_distance_km", 999)
            d_reason = row.get("disaster_alert_reason", "Environmental Event")
            
            if eq_mag >= 4.0 and eq_dist < 100:
                reason_text = f"Earthquake M{eq_mag} within {eq_dist}km. High seismic risk."
            else:
                reason_text = f"Risk Elevated Due To: {d_reason} detected in proximity."

        notifications.append({
            "notification_id": f"NOTIF-{row['segment_id']}-{severity}",
            "segment_id": row["segment_id"],
            "district": row["district"],
            "alert_type": alert_type,
            "severity_level": severity,
            "reason_text": reason_text,
            "timestamp": "Just Now",
            "technician_assigned": None, # Will be filled by main dispatch
            "acknowledged": False
        })
        
    return notifications
