import requests
import os
from typing import Dict, Any, List

# ── NASA Config ────────────────────────────────────────────────────────────
NASA_API_KEY = "9clCZuigWsnHpXK7OQYbu0bW171d436CXlxqfs0S"
# EONET: Earth Observatory Natural Event Tracker
EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events"
# NASA POWER: Prediction Of Worldwide Energy Resources (for rainfall/temp)
POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

def fetch_nasa_events() -> List[Dict[str, Any]]:
    """Fetch active natural events (storms, floods, etc.) from NASA EONET."""
    try:
        # Fetching severe storms and floods (Category IDs 10, 12)
        params = {"category": "severeStorms,floods", "status": "open"}
        response = requests.get(EONET_URL, params=params, timeout=10)
        if response.status_code == 200:
            return response.json().get("events", [])
        return []
    except Exception as e:
        print(f"NASA EONET Error: {e}")
        return []

def fetch_rainfall_data(lat: float, lon: float) -> float:
    """Fetch recent rainfall data (mm/day) for a specific location from NASA POWER."""
    try:
        # Example for the last 7 days average
        import datetime
        end = datetime.date.today()
        start = end - datetime.timedelta(days=7)
        
        params = {
            "parameters": "PRECTOTCORR", # Corrected Total Precipitation
            "community": "SB",
            "longitude": lon,
            "latitude": lat,
            "start": start.strftime("%Y%m%d"),
            "end": end.strftime("%Y%m%d"),
            "format": "JSON"
        }
        
        response = requests.get(POWER_URL, params=params, timeout=15)
        if response.status_code == 200:
            data = response.json()
            precip_values = data.get("properties", {}).get("parameter", {}).get("PRECTOTCORR", {})
            if precip_values:
                valid_values = [v for v in precip_values.values() if v >= 0]
                if valid_values:
                    return sum(valid_values) / len(valid_values)
        return 0.0 # Fallback
    except Exception as e:
        print(f"NASA POWER Error: {e}")
        return 0.0

def get_environmental_multipliers(lat: float, lon: float) -> Dict[str, float]:
    """Calculate risk multipliers based on NASA environmental data."""
    rainfall = fetch_rainfall_data(lat, lon)
    events = fetch_nasa_events()
    
    # Check if any event is near the coordinates (roughly within 1 degree)
    storm_multiplier = 1.0
    for event in events:
        for geometry in event.get("geometry", []):
            coords = geometry.get("coordinates")
            if coords and len(coords) == 2:
                # Simple distance check
                dist = ((coords[1] - lat)**2 + (coords[0] - lon)**2)**0.5
                if dist < 1.0:
                    storm_multiplier += 0.3 # Significant risk boost
                    break
    
    # Rainfall multiplier: High rainfall (> 10mm/day avg) increases risk
    rain_multiplier = 1.0
    if rainfall > 10:
        rain_multiplier += 0.2
    elif rainfall > 5:
        rain_multiplier += 0.1
        
    return {
        "nasa_rainfall": rainfall,
        "nasa_storm_multiplier": storm_multiplier,
        "nasa_rain_multiplier": rain_multiplier
    }
