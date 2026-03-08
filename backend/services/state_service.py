import asyncio
import random
import datetime
import pandas as pd
from typing import Dict, List, Any, Optional
from services.synthetic_service import generate_synthetic_data
from services.technician_service import get_all_technicians, TECHNICIANS

GLOBAL_STATE = {
    "segments_df": None,
    "last_update": None,
    "simulation_active": False
}

def initialize_state(limit: int = 50):
    """Populate initial synthetic data if not already present."""
    if GLOBAL_STATE["segments_df"] is None:
        print("Initializing Global State with synthetic data...")
        df = generate_synthetic_data(limit)
        # Import predict_risk here to avoid circular dependency
        from services.prediction_service import predict_risk
        df = predict_risk(df)
        GLOBAL_STATE["segments_df"] = df
        GLOBAL_STATE["last_update"] = datetime.datetime.now()

async def start_simulation():
    """Background task to simulate live network changes."""
    if GLOBAL_STATE["simulation_active"]:
        return
    
    GLOBAL_STATE["simulation_active"] = True
    print("Background Simulation Started.")
    
    while True:
        await asyncio.sleep(5) # Every 5 seconds
        
        if GLOBAL_STATE["segments_df"] is not None:
            df = GLOBAL_STATE["segments_df"]
            
            # 1. Randomly drift 2-3 segments' risk higher
            affected_indices = random.sample(range(len(df)), k=random.randint(1, 3))
            
            for idx in affected_indices:
                # DRIFT FEATURES instead of just score, so predict_risk (ML) picks it up
                current_degradation = df.at[idx, "signal_degradation_rate"] if "signal_degradation_rate" in df.columns else 0.1
                df.at[idx, "signal_degradation_rate"] = min(current_degradation + random.uniform(0.05, 0.1), 1.0)
                
                # Occasionally increase faults
                if random.random() > 0.8:
                    df.at[idx, "past_faults"] = df.at[idx, "past_faults"] + 1

                # If it becomes High risk in the next predict_risk call, 
                # we ensure alert_type is set. (predict_risk is called by routes)
                    
                    # 1b. Dynamic Technician Assignment
                    if pd.isna(df.at[idx, "assigned_technician_id"]) or df.at[idx, "assigned_technician_id"] is None:
                        from services.technician_service import get_nearest_technician
                        tech, dist = get_nearest_technician(
                            float(df.at[idx, "latitude"]),
                            float(df.at[idx, "longitude"]),
                            str(df.at[idx, "fiber_type"]),
                            str(df.at[idx, "zone_type"]),
                            str(df.at[idx, "segment_id"])
                        )
                        if tech:
                            df.at[idx, "assigned_technician_id"] = tech.id
                            df.at[idx, "assigned_technician_name"] = tech.name
                            df.at[idx, "estimated_arrival_time"] = round(dist * 100, 1) # Simple mock eta
                            df.at[idx, "assigned_technician_contact"] = tech.contact
                            df.at[idx, "dispatch_status"] = "Dispatched"

            # 2. Randomly jitter responder status
            # Find a technician and toggle status if they are not on mission
            # Technically TECHNICIANS is a list of objects in technician_service
            for tech in TECHNICIANS:
                if random.random() > 0.95: # 5% chance of toggle per tick
                    if tech.status == "Available":
                        tech.status = "Busy"
                    elif tech.status == "Busy":
                        tech.status = "Available"

            GLOBAL_STATE["last_update"] = datetime.datetime.now()
            # print(f"Simulation Tick: Updated {len(affected_indices)} segments.")

def get_state_data():
    return GLOBAL_STATE["segments_df"]

def update_state_data(df: pd.DataFrame):
    GLOBAL_STATE["segments_df"] = df
    GLOBAL_STATE["last_update"] = datetime.datetime.now()
