import pandas as pd
import io
from typing import Optional, Dict, Any

# ── Global State ───────────────────────────────────────────────────────────
# In a production app, this would be in Redis or a DB.
# For the hackathon, we use global variables.
_imported_data: Optional[pd.DataFrame] = None
_data_mode: str = "synthetic" # "synthetic" or "real"
_last_import_timestamp: Optional[str] = None

REQUIRED_COLUMNS = [
    "segment_id", "past_faults", "rainfall_mm", "construction_distance_m", 
    "soil_type", "traffic_density", "maintenance_gap_days", "landslide_risk_index"
]

def process_csv_upload(file_content: bytes) -> Dict[str, Any]:
    """Validate and store the uploaded CSV data."""
    global _imported_data, _data_mode, _last_import_timestamp
    try:
        df = pd.read_csv(io.BytesIO(file_content))
        
        # 1. Validate Schema
        missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing:
            return {"success": False, "error": f"Missing columns: {', '.join(missing)}"}
        
        # 2. Store Data
        _imported_data = df
        _data_mode = "real"
        import datetime
        _last_import_timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return {
            "success": True, 
            "message": f"Successfully imported {len(df)} segments.",
            "mode": _data_mode,
            "timestamp": _last_import_timestamp
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_data_mode() -> str:
    return _data_mode

def set_data_mode(mode: str):
    global _data_mode
    if mode in ["synthetic", "real"]:
        _data_mode = mode

def get_imported_data() -> Optional[pd.DataFrame]:
    return _imported_data

def get_import_metadata() -> Dict[str, Any]:
    return {
        "mode": _data_mode,
        "last_import": _last_import_timestamp,
        "record_count": len(_imported_data) if _imported_data is not None else 0
    }
