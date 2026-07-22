"""
APEX Core Configuration Module
================================
Centralized settings management using pydantic-settings.
All configuration is loaded from environment variables or a .env file.
"""

from pathlib import Path
from typing import List

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """
    Application settings with automatic environment variable loading.
    Priority: .env file -> environment variables -> defaults.
    """

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Application
    ENVIRONMENT: str = "development"  # development | staging | production
    APP_MODE: str = "development"  # development | demo | live
    APP_NAME: str = "APEX Decision Intelligence Engine"
    APP_VERSION: str = "1.0.0"
    LOG_LEVEL: str = "INFO"  # DEBUG | INFO | WARNING | ERROR

    # AI Provider
    AI_PROVIDER: str = Field(
        default="mock",
        validation_alias=AliasChoices("AI_PROVIDER", "DEFAULT_LLM_PROVIDER"),
    )  # mock | gemini | nim
    EMBEDDING_PROVIDER: str = Field(
        default="mock",
        validation_alias=AliasChoices("EMBEDDING_PROVIDER", "DEFAULT_EMBED_PROVIDER"),
    )  # mock | gemini | nim
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMINI_EMBEDDING_MODEL: str = "text-embedding-004"
    NIM_API_KEY: str = ""
    NIM_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NIM_RETRIEVAL_BASE_URL: str = "https://ai.api.nvidia.com/v1/retrieval/nvidia"
    NIM_MODEL: str = Field(
        default="meta/llama-3.1-70b-instruct",
        validation_alias=AliasChoices("NIM_MODEL", "NIM_REASONING_MODEL"),
    )
    NIM_OCR_MODEL: str = Field(
        default="nemotron-ocr-v2",
        validation_alias=AliasChoices("NIM_OCR_MODEL", "DEFAULT_OCR_MODEL"),
    )
    NIM_EMBED_MODEL: str = Field(
        default="nvidia/embed-qa-4",
        validation_alias=AliasChoices("NIM_EMBED_MODEL", "NIM_EMBEDDING_MODEL"),
    )

    # Database / Vector Store
    DATABASE_URL: str = "sqlite:///./apex.db"
    REDIS_URL: str = ""
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    QDRANT_HOST: str = ""  # Empty = in-memory mode
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "apex_documents"
    EMBEDDING_DIMENSION: int = 768

    # Security / CORS
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
    ]
    API_KEY_HEADER: str = "X-APEX-API-Key"

    # Feature Flags
    ENABLE_TELEMETRY: bool = False
    ENABLE_OCR: bool = True
    OCR_PROVIDER: str = Field(
        default="mock",
        validation_alias=AliasChoices("OCR_PROVIDER", "DEFAULT_OCR_PROVIDER"),
    )
    ENABLE_MOCK_OCR: bool = False  # Explicit opt-in for demo-only OCR fallback
    MAX_UPLOAD_SIZE_MB: int = 50

    @field_validator("AI_PROVIDER", "EMBEDDING_PROVIDER")
    @classmethod
    def validate_provider(cls, v: str) -> str:
        allowed = {"mock", "gemini", "nim"}
        if v.lower() not in allowed:
            raise ValueError(f"Provider must be one of {allowed}, got '{v}'")
        return v.lower()

    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v.lower() not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}")
        return v.lower()

    @field_validator("OCR_PROVIDER")
    @classmethod
    def validate_ocr_provider(cls, v: str) -> str:
        allowed = {"mock", "nim"}
        if v.lower() not in allowed:
            raise ValueError(f"OCR_PROVIDER must be one of {allowed}, got '{v}'")
        return v.lower()

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_mock_ai(self) -> bool:
        return self.AI_PROVIDER == "mock"

    @property
    def qdrant_mode(self) -> str:
        if self.QDRANT_URL:
            return "cloud"
        if self.QDRANT_HOST:
            return "local"
        return "in-memory"


settings = Settings()
