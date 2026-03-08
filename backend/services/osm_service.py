import os
import pandas as pd
import numpy as np
from sklearn.neighbors import BallTree

# Cache for exact coordinates
_CACHED_CONSTRUCTION_COORDS = None

def fetch_official_construction_data():
    """Fetches real-time construction sites from the local official CSV."""
    global _CACHED_CONSTRUCTION_COORDS
    
    if _CACHED_CONSTRUCTION_COORDS is not None:
        return _CACHED_CONSTRUCTION_COORDS

    filepath = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'government_construction_sites.csv')
    
    try:
        df = pd.read_csv(filepath)
        # Extract lat/lon and convert to radians
        coords = np.column_stack((np.radians(df['Latitude']), np.radians(df['Longitude'])))
        
        if len(coords) > 0:
            _CACHED_CONSTRUCTION_COORDS = coords
            print(f"[Core] Successfully loaded {len(coords)} official construction sites.")
            return _CACHED_CONSTRUCTION_COORDS
        else:
            return None
    except Exception as e:
        print(f"[Core] Error loading official construction sites: {e}")
        return None

def get_construction_proximity(latitudes, longitudes):
    """
    Given lists of latitudes and longitudes, returns a list of distances (in km) 
    to the nearest active real-world construction site from official records.
    """
    construction_coords = fetch_official_construction_data()
    
    if construction_coords is None or len(construction_coords) == 0:
        return [None] * len(latitudes)
        
    # Convert input coordinates to radians for BallTree
    query_coords = np.column_stack((np.radians(latitudes), np.radians(longitudes)))
    
    # Build a BallTree with haversine distance metric
    tree = BallTree(construction_coords, metric='haversine')
    
    # Query nearest neighbor (k=1)
    distances, _ = tree.query(query_coords, k=1)
    
    # Radius of earth in km
    earth_radius = 6371.0
    
    # Convert distances back to absolute km
    km_distances = distances.flatten() * earth_radius
    
    return np.round(km_distances, 2).tolist()
