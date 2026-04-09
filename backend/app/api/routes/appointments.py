from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import appointment as appointment_crud
from app.schemas.appointment import AppointmentCreate, AppointmentResponse, AppointmentUpdate
from app.services.appointment_service import get_appointment_service
from app.utils.datetime_helpers import parse_date
from typing import List, Optional

router = APIRouter()


@router.post("", response_model=AppointmentResponse, status_code=201)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    return appointment_crud.create_appointment(db, appointment)


@router.get("", response_model=List[dict])
def get_appointments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    appointments = appointment_crud.get_appointments(db, skip, limit, status)
    result = []
    for apt in appointments:
        result.append({
            "id": apt.id,
            "patient_id": apt.patient_id,
            "patient_name": apt.patient.full_name if apt.patient else "Unknown",
            "patient_phone": apt.patient.phone if apt.patient else "N/A",
            "patient_email": apt.patient.email if apt.patient else None,
            "service_type": apt.service_type,
            "appointment_date": apt.appointment_date.strftime("%Y-%m-%d") if apt.appointment_date else None,
            "appointment_time": apt.appointment_time,
            "status": apt.status,
            "reason": apt.reason,
            "notes": apt.notes,
            "created_at": apt.created_at.isoformat() if apt.created_at else None,
        })
    return result


@router.get("/available-slots")
def get_available_slots(date: str = Query(...), db: Session = Depends(get_db)):
    date_obj = parse_date(date)
    if not date_obj:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    service = get_appointment_service(db)
    slots = service.get_available_slots(date_obj)
    return {"date": date, "available_slots": slots}


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = appointment_crud.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    db: Session = Depends(get_db)
):
    appointment = appointment_crud.update_appointment(db, appointment_id, appointment_update)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.delete("/{appointment_id}", status_code=204)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    deleted = appointment_crud.delete_appointment(db, appointment_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Appointment not found")


@router.patch("/{appointment_id}")
def patch_appointment(
    appointment_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    valid_statuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    appointment = appointment_crud.update_appointment_status(db, appointment_id, status)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment
