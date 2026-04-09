from sqlalchemy.orm import Session
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from datetime import datetime
from typing import List, Optional


def create_appointment(db: Session, appointment: AppointmentCreate) -> Appointment:
    db_appointment = Appointment(
        patient_id=appointment.patient_id,
        service_type=appointment.service_type,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        reason=appointment.reason,
        notes=appointment.notes,
        status="booked"
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


def get_appointment(db: Session, appointment_id: int) -> Optional[Appointment]:
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()


def get_appointments(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Appointment]:
    query = db.query(Appointment)
    if status:
        query = query.filter(Appointment.status == status)
    return query.order_by(Appointment.appointment_date.desc()).offset(skip).limit(limit).all()


def get_patient_appointments(db: Session, patient_id: int) -> List[Appointment]:
    return db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(Appointment.appointment_date.desc()).all()


def update_appointment(db: Session, appointment_id: int, appointment_update: AppointmentUpdate) -> Optional[Appointment]:
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        update_data = appointment_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_appointment, key, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment


def cancel_appointment(db: Session, appointment_id: int) -> Optional[Appointment]:
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        db_appointment.status = "cancelled"
        db.commit()
        db.refresh(db_appointment)
    return db_appointment


def delete_appointment(db: Session, appointment_id: int) -> bool:
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
        return True
    return False


def get_appointments_by_date(db: Session, date: datetime) -> List[Appointment]:
    date_start = datetime(date.year, date.month, date.day, 0, 0, 0)
    date_end = datetime(date.year, date.month, date.day, 23, 59, 59)
    return db.query(Appointment).filter(
        Appointment.appointment_date >= date_start,
        Appointment.appointment_date <= date_end
    ).all()


def update_appointment_status(db: Session, appointment_id: int, status: str) -> Optional[Appointment]:
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        db_appointment.status = status
        db.commit()
        db.refresh(db_appointment)
    return db_appointment
