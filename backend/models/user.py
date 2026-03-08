from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    TECHNICIAN = "technician"

class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: EmailStr
    password: str  # This will be hashed
    role: UserRole

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
