from pydantic import BaseModel
from typing import Optional


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminResponse(BaseModel):
    id: int
    username: str
    name: str
    role: str
    token: Optional[str] = None

    class Config:
        from_attributes = True
