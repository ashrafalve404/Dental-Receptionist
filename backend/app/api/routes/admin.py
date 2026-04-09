from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.admin import AdminLogin, AdminResponse
from typing import List
from datetime import datetime, timedelta
from jose import jwt, JWTError
import hashlib

router = APIRouter()

SECRET_KEY = "as_clinic_super_secret_key_2024"
ALGORITHM = "HS256"

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD_HASH = hashlib.sha256("asclinic123".encode()).hexdigest()
ADMIN_NAME = "AS Clinic Admin"

MOCK_ADMINS = {
    ADMIN_USERNAME: {
        "id": 1,
        "username": ADMIN_USERNAME,
        "password_hash": ADMIN_PASSWORD_HASH,
        "name": ADMIN_NAME,
        "role": "admin"
    }
}


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


@router.post("/login", response_model=AdminResponse)
def login(credentials: AdminLogin, db: Session = Depends(get_db)):
    admin = MOCK_ADMINS.get(credentials.username)
    
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    password_hash = hashlib.sha256(credentials.password.encode()).hexdigest()
    
    if admin["password_hash"] != password_hash:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token({"sub": admin["username"], "role": admin["role"]})
    
    return {
        "id": admin["id"],
        "username": admin["username"],
        "name": admin["name"],
        "role": admin["role"],
        "token": access_token
    }


@router.get("/verify")
def verify_token_endpoint():
    return {"valid": True}
