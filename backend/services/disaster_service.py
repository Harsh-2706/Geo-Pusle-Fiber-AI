import requests
import time
from typing import List, Dict

# Tamil Nadu Bounding Box
TN_BOUNDS = {
    "min_lat": 8.0,
    "max_lat": 13.5,
    "min_lon": 76.0,
    "max_lon": 80.5
}

_CACHE = {"data": None, "timestamp": 0}
_TTL = 1800  # 30 mins

def fetch_disasters() -> List[Dict]:
    global _CACHE
    now = time.time()
    if _CACHE["data"] and (now - _CACHE["timestamp"] < _TTL):
        return _CACHE["data"]

    url = "https://eonet.gsfc.nasa.gov/api/v3/events"
    # Categories: floods, severeStorms, landslides, wildfires
    params = {"status": "open", "category": "floods,severeStorms,landslides,wildfires"}
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        events = response.json().get("events", [])
        
        tn_events = []
        for event in events:
            # Get geometry
            geometries = event.get("geometry", [])
            if not geometries: continue
            
            # Use most recent geometry
            last_geo = geometries[0]
            coords = last_geo.get("coordinates") # [lon, lat]
            if not coords: continue
            
            lon, lat = coords
            
            if (TN_BOUNDS["min_lat"] <= lat <= TN_BOUNDS["max_lat"] and 
                TN_BOUNDS["min_lon"] <= lon <= TN_BOUNDS["max_lon"]):
                tn_events.append({
                    "id": event.get("id"),
                    "title": event.get("title"),
                    "type": event.get("categories", [{}])[0].get("title", "Event"),
                    "lat": lat,
                    "lon": lon,
                    "date": last_geo.get("date")
                })
        
        _CACHE = {"data": tn_events, "timestamp": now}
        return tn_events
    except Exception as e:
        print(f"[NASA EONET] Error: {e}")
        return []
