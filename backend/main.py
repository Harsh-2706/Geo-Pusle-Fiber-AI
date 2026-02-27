from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from services.synthetic_service import generate_synthetic_data, generate_notifications
from services.prediction_service import predict_risk
from services.technician_service import get_all_technicians, get_nearest_technician

app = FastAPI(title="TANFINET Fiber Risk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/dashboard")
def get_dashboard():
    df = generate_synthetic_data(50)
    df = predict_risk(df)
    return df.to_dict(orient="records")

@app.get("/technicians")
def get_technicians():
    return get_all_technicians()

@app.get("/alerts/live")
def get_live_alerts():
    # 1. Generate core state
    df = generate_synthetic_data(100) # Higher sample for alerts
    df = predict_risk(df)
    
    # 2. Extract alerts
    notifications = generate_notifications(df)
    
    # 3. Dispatch Integration
    for n in notifications:
        if n["severity_level"] in ["CRITICAL", "HIGH"]:
            # Find the segment row in df
            seg_matches = df[df["segment_id"] == n["segment_id"]]
            if not seg_matches.empty:
                seg_row = seg_matches.iloc[0]
                
                tech, _ = get_nearest_technician(
                    seg_row["latitude"], 
                    seg_row["longitude"], 
                    seg_row["fiber_type"], 
                    seg_row["zone_type"], 
                    seg_row["segment_id"]
                )
                
                if tech:
                    n["technician_assigned"] = {
                        "id": tech.id,
                        "name": tech.name,
                        "specialty": tech.skill_level,
                        "eta": random.randint(5, 45) # Simulated ETA in minutes
                    }

    critical_count = len([n for n in notifications if n["severity_level"] == "CRITICAL"])
    return {
        "notifications": notifications,
        "active_alert_count": len(notifications),
        "critical_count": critical_count
    }