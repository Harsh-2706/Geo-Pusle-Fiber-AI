from fastapi import APIRouter, Depends, Query
from services.prediction_service import predict_risk, get_current_dataset
from routes.auth_routes import get_current_user, get_admin_user
from services.disaster_service import fetch_disasters
from services.earthquake_service import fetch_earthquakes
from models.user import User, UserRole
from typing import List, Optional

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("/dashboard")
async def get_dashboard(limit: int = 50, current_user: User = Depends(get_current_user)):
    """
    Get prediction dashboard data.
    ADMINs get all segments.
    TECHNICIANs get only high-risk segments for their focused view.
    """
    df = get_current_dataset(limit)
    df = predict_risk(df)
    
    # Both ADMIN and TECHNICIAN roles receive the same dataset
    # ensuring data synchronization across sessions.
    return df.to_dict(orient="records")

@router.get("/alerts")
async def get_alerts(current_user: User = Depends(get_current_user)):
    """Get active alerts for both roles."""
    from services.synthetic_service import generate_notifications
    
    df = get_current_dataset(100)
    df = predict_risk(df)
    notifications = generate_notifications(df)
    
    # Filter for technicians if needed
    if current_user.role == UserRole.TECHNICIAN:
        notifications = [n for n in notifications if n["severity_level"] in ["CRITICAL", "HIGH"]]
        
    return notifications

@router.get("/construction-sites")
async def get_construction_sites(current_user: User = Depends(get_current_user)):
    """Returns the official list of construction sites for map plotting."""
    from services.osm_service import fetch_official_construction_data
    import numpy as np
    
    # These are stored in radians by the service, need to convert back to degrees for the frontend
    coords = fetch_official_construction_data()
    if coords is None:
        return []
        
    coords_deg = np.degrees(coords)
    # Return as list of dicts {lat, lon}
    return [{"lat": float(c[0]), "lon": float(c[1])} for c in coords_deg]
@router.get("/disasters")
async def get_disasters(current_user: User = Depends(get_current_user)):
    """Returns combinedNASA and USGS events for map plotting."""
    try:
        disasters = fetch_disasters()
        earthquakes = fetch_earthquakes()
        return {
            "disasters": disasters,
            "earthquakes": earthquakes
        }
    except Exception as e:
        print(f"Disaster route error: {e}")
        return {"disasters": [], "earthquakes": []}
