import logging
from datetime import datetime
import random
import math

logger = logging.getLogger(__name__)

# Mock list of major events or festivals in Tamil Nadu that would draw massive crowds
FESTIVAL_DB = [
    {
        "id": "TNF001",
        "name": "Maha Shivaratri Temple Gathering",
        "location": "Thanjavur",
        "lat": 10.7828,
        "lon": 79.1318,
        "expected_crowd_index": 0.85,
        "active_range": (14, 28) # Active days in Feb
    },
    {
        "id": "TNF002",
        "name": "Local District Exhibitions",
        "location": "Madurai",
        "lat": 9.9252,
        "lon": 78.1198,
        "expected_crowd_index": 0.70,
        "active_range": (1, 30)
    },
    {
        "id": "TNF003",
        "name": "Tech Hub Commuter Surge",
        "location": "Chennai",
        "lat": 13.0827,
        "lon": 80.2707,
        "expected_crowd_index": 0.90,
        "active_range": (1, 31)
    },
     {
        "id": "TNF004",
        "name": "Industrial Expo",
        "location": "Coimbatore",
        "lat": 11.0168,
        "lon": 76.9558,
        "expected_crowd_index": 0.75,
        "active_range": (15, 30)
    }
]

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def get_active_festivals():
    """Returns currently active festivals based on today's date"""
    today = datetime.now()
    active = []
    
    for fest in FESTIVAL_DB:
        start, end = fest["active_range"]
        if start <= today.day <= end:
            active.append(fest)
            
    return active

def calculate_crowd_intelligence_for_segment(lat, lon):
    """
    Given a segment's lat/lon, find the nearest active festival
    and return the amplified crowd intensity and festival data
    """
    active_festivals = get_active_festivals()
    
    nearest_festival = None
    min_dist = float('inf')
    
    for fest in active_festivals:
        dist = haversine_distance(lat, lon, fest["lat"], fest["lon"])
        if dist < min_dist:
            min_dist = dist
            nearest_festival = fest
            
    # Default outputs if no festival is near
    result = {
        "crowd_intensity_index": 0.0,
        "nearest_festival_name": None,
        "festival_proximity_km": None
    }
            
    # If the segment is within 50km of an active festival, calculate impact
    if nearest_festival and min_dist <= 50.0:
        # Inverse distance weighting - closer = higher intensity
        distance_factor = max(0.1, 1.0 - (min_dist / 50.0))
        calculated_intensity = nearest_festival["expected_crowd_index"] * distance_factor
        
        result["crowd_intensity_index"] = round(calculated_intensity, 3)
        result["nearest_festival_name"] = nearest_festival["name"]
        result["festival_proximity_km"] = round(min_dist, 2)
        
    return result

