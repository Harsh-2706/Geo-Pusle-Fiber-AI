import requests
import time
import pandas as pd
import numpy as np

# Cache mechanism
_WEATHER_CACHE = {}
_CACHE_TTL = 1800  # 30 minutes in seconds

def fetch_real_weather_data(latitudes, longitudes):
    """
    Fetches real-time weather data from Open-Meteo API for a list of coordinates.
    Uses caching to avoid rate limits.
    """
    global _WEATHER_CACHE
    current_time = time.time()
    
    results = {
        "temperature_2m": [],
        "precipitation": [],
        "wind_speed_10m": [],
        "wind_gusts_10m": [],
        "soil_moisture_0_1cm": [],
        "soil_moisture_3_9cm": []
    }
    
    # Process coordinates in batches to be efficient, but for now we can iterate or use the bulk API if supported
    # Open-Meteo supports multiple coordinates by passing comma-separated lists
    
    # We will do a single request if all coordinates fit or batches
    # For GeoPulse, we have 50 segments usually, so a single request with comma-separated lats/lons works
    
    lat_str = ",".join(map(str, latitudes))
    lon_str = ",".join(map(str, longitudes))
    
    # Check cache based on hash (simple approach: cache entire result for the given input signature)
    cache_key = hash(lat_str + lon_str)
    if cache_key in _WEATHER_CACHE:
        cache_data, timestamp = _WEATHER_CACHE[cache_key]
        if current_time - timestamp < _CACHE_TTL:
            print("[Open-Meteo] Using cached weather data.")
            return cache_data
            
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat_str,
        "longitude": lon_str,
        "current": ["temperature_2m", "precipitation", "wind_speed_10m", "wind_gusts_10m", "soil_moisture_0_1cm", "soil_moisture_3_9cm"],
        "timezone": "auto"
    }
    
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        # Open-Meteo returns a list if multiple coordinates are passed, 
        # or a single dict if one coordinate is passed (or if the API behavior varies).
        data_list = data if isinstance(data, list) else [data]
        
        for loc_data in data_list:
            current = loc_data.get("current", {})
            results["temperature_2m"].append(current.get("temperature_2m", 25.0))
            results["precipitation"].append(current.get("precipitation", 0.0))
            results["wind_speed_10m"].append(current.get("wind_speed_10m", 0.0))
            results["wind_gusts_10m"].append(current.get("wind_gusts_10m", 0.0))
            results["soil_moisture_0_1cm"].append(current.get("soil_moisture_0_1cm", 0.2))
            results["soil_moisture_3_9cm"].append(current.get("soil_moisture_3_9cm", 0.2))
        
        # Guard against mismatching lengths (rare API edge case)
        if len(results["temperature_2m"]) < len(latitudes):
            gap = len(latitudes) - len(results["temperature_2m"])
            for k in results:
                results[k].extend([results[k][-1]] * gap if results[k] else [0] * gap)
                 
        _WEATHER_CACHE[cache_key] = (results, current_time)
        print("[Open-Meteo] Successfully fetched real-time weather data.")
        return results
        
    except Exception as e:
        print(f"[Open-Meteo] API Error: {e}. Falling back to synthetic.")
        return None
