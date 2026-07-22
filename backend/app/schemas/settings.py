from datetime import datetime
from typing import Dict, List

from pydantic import BaseModel, Field


class ProviderStatus(BaseModel):
    ai_provider: str
    embedding_provider: str
    ocr_provider: str
    qdrant_mode: str
    environment: str
    app_mode: str
    telemetry_enabled: bool


class PlatformSettingsBase(BaseModel):
    ai_provider: str = Field(..., min_length=3, max_length=50)
    embedding_provider: str = Field(..., min_length=3, max_length=50)
    ocr_provider: str = Field(..., min_length=3, max_length=50)
    confidence_threshold: int = Field(..., ge=50, le=99)
    top_k: int = Field(..., ge=1, le=50)
    rerank_top_k: int = Field(..., ge=1, le=25)
    enable_reranking: bool
    theme: str = Field(..., min_length=4, max_length=20)
    notifications_enabled: bool
    api_base_url: str = Field(..., min_length=1, max_length=255)
    environment_status: str = Field(..., min_length=3, max_length=50)
    notification_channels: List[str] = Field(default_factory=list)


class PlatformSettingsUpdate(PlatformSettingsBase):
    pass


class PlatformSettingsResponse(PlatformSettingsBase):
    provider_status: ProviderStatus
    updated_by: str | None = None
    updated_at: datetime | None = None


class PlatformSettingsEnvelope(BaseModel):
    settings: PlatformSettingsResponse
    available_ai_providers: List[str]
    available_embedding_providers: List[str]
    available_ocr_providers: List[str]
    effective_runtime: Dict[str, str | bool | int]
