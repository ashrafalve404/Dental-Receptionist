import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    APP_NAME: str = "AS Clinic API"
    APP_ENV: str = "development"
    DATABASE_URL: str = "sqlite:///./as_clinic.db"
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    
    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
