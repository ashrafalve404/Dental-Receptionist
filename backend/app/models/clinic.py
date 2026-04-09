from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base


class ClinicSettings(Base):
    __tablename__ = "clinic_settings"

    id = Column(Integer, primary_key=True, index=True)
    clinic_name = Column(String(255), default="AS Clinic")
    address = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    opening_time = Column(String(10), default="09:00")
    closing_time = Column(String(10), default="20:00")
    working_days = Column(String(100), default="Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday")
    slot_duration_minutes = Column(Integer, default=30)
    emergency_note = Column(Text, nullable=True)


class FAQItem(Base):
    __tablename__ = "faq_items"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(50), nullable=True)
