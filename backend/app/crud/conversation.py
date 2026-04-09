from sqlalchemy.orm import Session
from app.models.conversation import Conversation
from app.schemas.conversation import ConversationCreate
from typing import List, Optional


def create_conversation(db: Session, conversation: ConversationCreate) -> Conversation:
    db_conversation = Conversation(**conversation.model_dump())
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation


def get_conversations_by_session(db: Session, session_id: str) -> List[Conversation]:
    return db.query(Conversation).filter(
        Conversation.session_id == session_id
    ).order_by(Conversation.created_at.asc()).all()


def get_conversation(db: Session, conversation_id: int) -> Optional[Conversation]:
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()


def get_recent_conversations(db: Session, session_id: str, limit: int = 10) -> List[Conversation]:
    return db.query(Conversation).filter(
        Conversation.session_id == session_id
    ).order_by(Conversation.created_at.desc()).limit(limit).all()


def delete_conversations_by_session(db: Session, session_id: str) -> int:
    conversations = db.query(Conversation).filter(Conversation.session_id == session_id).all()
    count = len(conversations)
    for conv in conversations:
        db.delete(conv)
    db.commit()
    return count


def get_all_conversations(db: Session, skip: int = 0, limit: int = 50) -> List[Conversation]:
    return db.query(Conversation).order_by(Conversation.created_at.desc()).offset(skip).limit(limit).all()
