from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class AIChatRequest(BaseModel):
    session_id: str
    patient_id: Optional[int] = None
    message: str


class AIChatResponse(BaseModel):
    response: str
    intent: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None
    booking_confirmed: Optional[bool] = None


class AIBookingRequest(BaseModel):
    session_id: str
    patient_id: Optional[int] = None
    full_name: str
    phone: str
    service_type: str
    appointment_date: str
    appointment_time: str
    reason: Optional[str] = None


class AIRescheduleRequest(BaseModel):
    session_id: str
    appointment_id: int
    new_date: str
    new_time: str


class AICancelRequest(BaseModel):
    session_id: str
    appointment_id: int
    reason: Optional[str] = None


class BookingConfirmation(BaseModel):
    appointment_id: int
    full_name: str
    phone: str
    service_type: str
    appointment_date: str
    appointment_time: str
    message: str
