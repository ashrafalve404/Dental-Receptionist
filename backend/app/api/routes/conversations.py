from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.conversation import Conversation
from app.models.patient import Patient

router = APIRouter()


@router.get("")
def get_all_conversations_endpoint(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    conversations = db.query(
        Conversation.session_id,
        func.max(Conversation.id).label('id'),
        func.max(Conversation.created_at).label('created_at')
    ).group_by(Conversation.session_id).offset(skip).limit(limit).all()

    result = []
    for conv in conversations:
        session_conversations = db.query(Conversation).filter(
            Conversation.session_id == conv.session_id
        ).order_by(Conversation.created_at.asc()).all()
        
        first_conv = session_conversations[0] if session_conversations else None
        
        patient_name = "Anonymous"
        patient_phone = "N/A"
        if first_conv and first_conv.patient_id:
            patient = db.query(Patient).filter(Patient.id == first_conv.patient_id).first()
            if patient:
                patient_name = patient.full_name
                patient_phone = patient.phone
        
        messages = []
        for msg in session_conversations:
            messages.append({
                "id": msg.id,
                "role": msg.role,
                "message": msg.message,
                "created_at": msg.created_at.isoformat() if msg.created_at else None
            })
        
        result.append({
            "id": conv.id,
            "session_id": conv.session_id,
            "patient_name": patient_name,
            "patient_phone": patient_phone,
            "created_at": conv.created_at.isoformat() if conv.created_at else None,
            "messages": messages
        })
    
    return result


@router.delete("/session/{session_id}")
def delete_conversation_by_session(session_id: str, db: Session = Depends(get_db)):
    """Delete all conversations for a specific session (patient)"""
    deleted = db.query(Conversation).filter(Conversation.session_id == session_id).delete()
    db.commit()
    return {"success": True, "deleted_count": deleted, "session_id": session_id}


@router.delete("/{conversation_id}")
def delete_conversation_message(conversation_id: int, db: Session = Depends(get_db)):
    """Delete a specific conversation message"""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation:
        db.delete(conversation)
        db.commit()
        return {"success": True, "deleted_id": conversation_id}
    return {"success": False, "error": "Conversation not found"}, 404