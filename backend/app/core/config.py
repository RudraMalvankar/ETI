"""
APEX Core Configuration Module
================================
Centralised settings management using pydantic-settings.
All configuration is loaded from environment variables or a .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    """
    Application settings with automatic environment variable loading.
    Priority: .env file → environment variables → defaults.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ── Application ──────────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"        # development | staging | production
    APP_NAME: str = "APEX Decision Intelligence Engine"
    APP_VERSION: str = "1.0.0"
    LOG_LEVEL: str = "INFO"                 # DEBUG | INFO | WARNING | ERROR

    # ── AI Provider ──────────────────────────────────────────────────────────
    AI_PROVIDER: str = "mock"              # mock | gemini | nim
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMINI_EMBEDDING_MODEL: str = "text-embedding-004"
    NIM_API_KEY: str = ""
    NIM_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NIM_MODEL: str = "meta/llama-3.1-70b-instruct"

    # ── Database / Vector Store ───────────────────────────────────────────────
    QDRANT_HOST: str = ""                  # Empty = in-memory mode
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "apex_documents"

    # ── Security / CORS ──────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = ""
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
    ]
    API_KEY_HEADER: str = "X-APEX-API-Key"  # Future: API key auth

    # ── Feature Flags ─────────────────────────────────────────────────────────
    ENABLE_TELEMETRY: bool = False
    ENABLE_MOCK_OCR: bool = True           # Set False when real OCR is configured
    MAX_UPLOAD_SIZE_MB: int = 50

    @field_validator("AI_PROVIDER")
    @classmethod
    def validate_provider(cls, v: str) -> str:
        allowed = {"mock", "gemini", "nim"}
        if v.lower() not in allowed:
            raise ValueError(f"AI_PROVIDER must be one of {allowed}, got '{v}'")
        return v.lower()

    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v.lower() not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}")
        return v.lower()

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_mock_ai(self) -> bool:
        return self.AI_PROVIDER == "mock"


# Global singleton — import this everywhere
settings = Settings()
