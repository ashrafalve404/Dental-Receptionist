from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ConversationBase(BaseModel):
    session_id: str
    role: str
    message: str


class ConversationCreate(ConversationBase):
    patient_id: Optional[int] = None


class ConversationResponse(ConversationBase):
    id: int
    patient_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
