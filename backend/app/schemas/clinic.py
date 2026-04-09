from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ClinicSettingsBase(BaseModel):
    clinic_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    working_days: Optional[str] = None
    slot_duration_minutes: Optional[int] = None
    emergency_note: Optional[str] = None


class ClinicSettingsResponse(ClinicSettingsBase):
    id: int

    class Config:
        from_attributes = True


class ClinicSettingsUpdate(BaseModel):
    clinic_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    working_days: Optional[str] = None
    slot_duration_minutes: Optional[int] = None
    emergency_note: Optional[str] = None
    about: Optional[str] = None


class FAQItemBase(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None


class FAQItemResponse(FAQItemBase):
    id: int

    class Config:
        from_attributes = True
