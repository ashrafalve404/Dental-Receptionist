from sqlalchemy.orm import Session
from app.models.clinic import ClinicSettings, FAQItem
from app.schemas.clinic import ClinicSettingsUpdate
from typing import List, Optional


def get_clinic_settings(db: Session) -> Optional[ClinicSettings]:
    return db.query(ClinicSettings).first()


def update_clinic_settings(db: Session, settings_update: ClinicSettingsUpdate) -> Optional[ClinicSettings]:
    settings = get_clinic_settings(db)
    if settings:
        update_data = settings_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(settings, key, value)
        db.commit()
        db.refresh(settings)
    return settings


def create_faq(db: Session, question: str, answer: str, category: str = None) -> FAQItem:
    db_faq = FAQItem(question=question, answer=answer, category=category)
    db.add(db_faq)
    db.commit()
    db.refresh(db_faq)
    return db_faq


def get_faqs(db: Session, category: Optional[str] = None) -> List[FAQItem]:
    query = db.query(FAQItem)
    if category:
        query = query.filter(FAQItem.category == category)
    return query.all()


def get_faq(db: Session, faq_id: int) -> Optional[FAQItem]:
    return db.query(FAQItem).filter(FAQItem.id == faq_id).first()


def update_faq(db: Session, faq_id: int, question: str, answer: str, category: str = None) -> Optional[FAQItem]:
    faq = get_faq(db, faq_id)
    if faq:
        faq.question = question
        faq.answer = answer
        if category is not None:
            faq.category = category
        db.commit()
        db.refresh(faq)
    return faq


def delete_faq(db: Session, faq_id: int) -> bool:
    faq = get_faq(db, faq_id)
    if faq:
        db.delete(faq)
        db.commit()
        return True
    return False
