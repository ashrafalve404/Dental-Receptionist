from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class AppointmentBase(BaseModel):
    service_type: str
    appointment_date: datetime
    appointment_time: str
    reason: Optional[str] = None
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    patient_id: int


class AppointmentResponse(AppointmentBase):
    id: int
    patient_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AppointmentUpdate(BaseModel):
    service_type: Optional[str] = None
    appointment_date: Optional[datetime] = None
    appointment_time: Optional[str] = None
    status: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: str
