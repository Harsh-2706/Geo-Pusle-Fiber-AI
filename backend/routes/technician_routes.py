from fastapi import APIRouter
from services.technician_service import get_all_technicians, get_nearest_technician

router = APIRouter(prefix="/technicians", tags=["Technicians"])

@router.get("/")
def get_technicians():
    return get_all_technicians()
