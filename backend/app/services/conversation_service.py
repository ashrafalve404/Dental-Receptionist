from sqlalchemy.orm import Session
from app.models.conversation import Conversation
from app.crud.conversation import (
    create_conversation,
    get_conversations_by_session,
    get_recent_conversations
)
from app.schemas.conversation import ConversationCreate
from typing import List, Dict, Any


class ConversationService:
    def __init__(self, db: Session):
        self.db = db
    
    def add_message(
        self,
        session_id: str,
        role: str,
        message: str,
        patient_id: int = None
    ) -> Conversation:
        conv_data = ConversationCreate(
            session_id=session_id,
            role=role,
            message=message,
            patient_id=patient_id
        )
        return create_conversation(self.db, conv_data)
    
    def get_history(self, session_id: str) -> List[Conversation]:
        return get_conversations_by_session(self.db, session_id)
    
    def get_history_for_ai(self, session_id: str) -> List[Dict[str, str]]:
        conversations = get_conversations_by_session(self.db, session_id)
        return [
            {
                "role": conv.role,
                "content": conv.message
            }
            for conv in conversations
        ]
    
    def get_recent_history(self, session_id: str, limit: int = 10) -> List[Conversation]:
        return get_recent_conversations(self.db, session_id, limit)


def get_conversation_service(db: Session) -> ConversationService:
    return ConversationService(db)
