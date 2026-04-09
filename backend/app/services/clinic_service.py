from sqlalchemy.orm import Session
from app.crud.clinic import get_clinic_settings, get_faqs, update_clinic_settings as crud_update_settings
from app.models.clinic import ClinicSettings, FAQItem
from app.schemas.clinic import ClinicSettingsUpdate
from typing import List, Optional


class ClinicService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_info(self) -> Optional[ClinicSettings]:
        return get_clinic_settings(self.db)
    
    def get_all_faqs(self) -> List[FAQItem]:
        return get_faqs(self.db)
    
    def get_faqs_by_category(self, category: str) -> List[FAQItem]:
        return get_faqs(self.db, category)
    
    def get_services(self) -> List[str]:
        return [
            "Dental Checkup",
            "Teeth Cleaning",
            "Tooth Extraction",
            "Root Canal",
            "Braces Consultation",
            "Teeth Whitening",
            "Gum Treatment"
        ]
    
    def get_working_hours(self) -> dict:
        settings = get_clinic_settings(self.db)
        if not settings:
            return {}
        
        return {
            "opening_time": settings.opening_time,
            "closing_time": settings.closing_time,
            "working_days": settings.working_days.split(","),
            "slot_duration": settings.slot_duration_minutes
        }
    
    def update_settings(self, settings_update: ClinicSettingsUpdate) -> Optional[ClinicSettings]:
        return crud_update_settings(self.db, settings_update)


def get_clinic_service(db: Session) -> ClinicService:
    return ClinicService(db)
