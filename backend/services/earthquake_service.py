import requests
import time
from datetime import datetime, timedelta
from typing import List, Dict

# Tamil Nadu Bounding Box
TN_BOUNDS = {
    "min_lat": 8.0,
    "max_lat": 13.5,
    "min_lon": 76.0,
    "max_lon": 80.5
}

_CACHE = {"data": None, "timestamp": 0}
_TTL = 1800

def fetch_earthquakes() -> List[Dict]:
    global _CACHE
    now = time.time()
    if _CACHE["data"] and (now - _CACHE["timestamp"] < _TTL):
        return _CACHE["data"]

    # Past 24 hours
    start_time = (datetime.utcnow() - timedelta(days=1)).isoformat()
    url = f"https://earthquake.usgs.gov/fdsnws/event/1/query"
    params = {
        "format": "geojson",
        "starttime": start_time,
        "minmagnitude": 3.5,
        "minlatitude": TN_BOUNDS["min_lat"],
        "maxlatitude": TN_BOUNDS["max_lat"],
        "minlongitude": TN_BOUNDS["min_lon"],
        "maxlongitude": TN_BOUNDS["max_lon"]
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        features = data.get("features", [])
        
        eqs = []
        for feat in features:
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            coords = geom.get("coordinates") # [lon, lat, depth]
            
            if coords:
                eqs.append({
                    "id": feat.get("id"),
                    "mag": props.get("mag"),
                    "place": props.get("place"),
                    "time": props.get("time"),
                    "lat": coords[1],
                    "lon": coords[0]
                })
        
        _CACHE = {"data": eqs, "timestamp": now}
        return eqs
    except Exception as e:
        print(f"[USGS Earthquake] Error: {e}")
        return []
