from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.clinic import create_faq, get_faqs, get_faq, update_faq, delete_faq
from app.schemas.clinic import FAQItemResponse, FAQItemBase
from typing import List

router = APIRouter()


@router.get("", response_model=List[FAQItemResponse])
def get_all_faqs(db: Session = Depends(get_db)):
    return get_faqs(db)


@router.post("", response_model=FAQItemResponse, status_code=201)
def create_faq_item(faq: FAQItemBase, db: Session = Depends(get_db)):
    return create_faq(db, faq.question, faq.answer, faq.category)


@router.get("/{faq_id}", response_model=FAQItemResponse)
def get_faq_item(faq_id: int, db: Session = Depends(get_db)):
    faq = get_faq(db, faq_id)
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return faq


@router.put("/{faq_id}", response_model=FAQItemResponse)
def update_faq_item(faq_id: int, faq: FAQItemBase, db: Session = Depends(get_db)):
    updated = update_faq(db, faq_id, faq.question, faq.answer, faq.category)
    if not updated:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return updated


@router.delete("/{faq_id}", status_code=204)
def delete_faq_item(faq_id: int, db: Session = Depends(get_db)):
    deleted = delete_faq(db, faq_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="FAQ not found")