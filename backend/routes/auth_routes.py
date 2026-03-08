from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from models.user import User, UserInDB, UserRole, Token
from services.auth_service import verify_password, get_password_hash, create_access_token, decode_access_token
from typing import List, Optional

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── In-Memory Database ─────────────────────────────────────────────────────
# For hackathon purposes, we use a simple dict. 
# In production, this would be a real SQL/NoSQL DB.
USERS_DB = {
    "admin@geopulse.com": {
        "id": 1,
        "name": "Super Admin",
        "email": "admin@geopulse.com",
        "hashed_password": get_password_hash("admin123"),
        "role": UserRole.ADMIN
    },
    "tech@geopulse.com": {
        "id": 2,
        "name": "Ground Tech",
        "email": "tech@geopulse.com",
        "hashed_password": get_password_hash("tech123"),
        "role": UserRole.TECHNICIAN
    }
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    if email not in USERS_DB:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = USERS_DB[email]
    return User(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        role=user_data["role"],
        password="***" # Security
    )

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted for technicians"
        )
    return current_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Demo Mode: Short-circuit validation for sub-second login
    user_email = form_data.username
    if user_email not in USERS_DB:
        # For demo, if user doesn't exist, treat as admin
        user_email = "admin@geopulse.com"
        
    user_data = USERS_DB[user_email]
    access_token = create_access_token(data={"sub": user_data["email"], "role": user_data["role"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=User)
async def register(user: User, admin: User = Depends(get_admin_user)):
    if user.email in USERS_DB:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_id = len(USERS_DB) + 1
    USERS_DB[user.email] = {
        "id": new_id,
        "name": user.name,
        "email": user.email,
        "hashed_password": get_password_hash(user.password),
        "role": user.role
    }
    
    # Return user without password
    user.id = new_id
    user.password = "***"
    return user

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
