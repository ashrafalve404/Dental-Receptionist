from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate
from typing import List, Optional


def create_patient(db: Session, patient: PatientCreate) -> Patient:
    db_patient = Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


def get_patient(db: Session, patient_id: int) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.id == patient_id).first()


def get_patient_by_phone(db: Session, phone: str) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.phone == phone).first()


def get_patients(db: Session, skip: int = 0, limit: int = 100) -> List[Patient]:
    return db.query(Patient).offset(skip).limit(limit).all()


def update_patient(db: Session, patient_id: int, patient_update: PatientUpdate) -> Optional[Patient]:
    db_patient = get_patient(db, patient_id)
    if db_patient:
        update_data = patient_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_patient, key, value)
        db.commit()
        db.refresh(db_patient)
    return db_patient


def delete_patient(db: Session, patient_id: int) -> bool:
    from app.models.appointment import Appointment
    from app.models.conversation import Conversation
    
    db_patient = get_patient(db, patient_id)
    if db_patient:
        db.query(Appointment).filter(Appointment.patient_id == patient_id).delete()
        db.query(Conversation).filter(Conversation.patient_id == patient_id).delete()
        db.delete(db_patient)
        db.commit()
        return True
    return False
