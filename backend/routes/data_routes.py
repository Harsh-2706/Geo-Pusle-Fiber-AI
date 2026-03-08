from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from services.csv_service import process_csv_upload, get_data_mode, set_data_mode, get_import_metadata
from routes.auth_routes import get_admin_user
from models.user import User

router = APIRouter(prefix="/data", tags=["Data Management"])

@router.post("/import-csv")
async def import_csv(file: UploadFile = File(...), admin: User = Depends(get_admin_user)):
    """Upload a CSV to override synthetic data."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    content = await file.read()
    result = process_csv_upload(content)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.get("/mode")
async def get_mode():
    """Get current data mode and metadata."""
    return get_import_metadata()

@router.post("/switch-to-synthetic")
async def switch_to_synthetic(admin: User = Depends(get_admin_user)):
    """Force switch back to synthetic data."""
    set_data_mode("synthetic")
    return {"message": "Switched to synthetic data mode", "mode": "synthetic"}
