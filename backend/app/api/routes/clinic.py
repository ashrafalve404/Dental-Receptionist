from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.clinic_service import get_clinic_service
from app.schemas.clinic import ClinicSettingsResponse, FAQItemResponse, ClinicSettingsUpdate
from typing import List

router = APIRouter()


@router.get("/info", response_model=ClinicSettingsResponse)
def get_clinic_info(db: Session = Depends(get_db)):
    service = get_clinic_service(db)
    info = service.get_info()
    return info


@router.get("/faqs", response_model=List[FAQItemResponse])
def get_clinic_faqs(db: Session = Depends(get_db)):
    service = get_clinic_service(db)
    return service.get_all_faqs()


@router.get("/settings", response_model=ClinicSettingsResponse)
def get_clinic_settings(db: Session = Depends(get_db)):
    service = get_clinic_service(db)
    return service.get_info()


@router.put("/settings", response_model=ClinicSettingsResponse)
def update_clinic_settings(settings: ClinicSettingsUpdate, db: Session = Depends(get_db)):
    service = get_clinic_service(db)
    return service.update_settings(settings)
