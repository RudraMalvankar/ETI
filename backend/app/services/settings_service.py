from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import PlatformSettingsModel
from app.schemas.settings import (
    PlatformSettingsEnvelope,
    PlatformSettingsResponse,
    PlatformSettingsUpdate,
    ProviderStatus,
)


class SettingsService:
    AVAILABLE_AI_PROVIDERS = ["gemini", "nim", "mock"]
    AVAILABLE_EMBEDDING_PROVIDERS = ["gemini", "nim", "mock"]
    AVAILABLE_OCR_PROVIDERS = ["nim", "mock"]

    @staticmethod
    def _runtime_status() -> ProviderStatus:
        return ProviderStatus(
            ai_provider=settings.AI_PROVIDER,
            embedding_provider=settings.AI_PROVIDER,
            ocr_provider=settings.OCR_PROVIDER,
            qdrant_mode=settings.qdrant_mode,
            environment=settings.ENVIRONMENT,
            app_mode=settings.APP_MODE,
            telemetry_enabled=settings.ENABLE_TELEMETRY,
        )

    @classmethod
    def _default_record(cls) -> PlatformSettingsResponse:
        return PlatformSettingsResponse(
            ai_provider=settings.AI_PROVIDER,
            embedding_provider="nim" if settings.NIM_API_KEY else "gemini",
            ocr_provider=settings.OCR_PROVIDER,
            confidence_threshold=85,
            top_k=10,
            rerank_top_k=5,
            enable_reranking=True,
            theme="dark",
            notifications_enabled=True,
            api_base_url="/api/v1",
            environment_status=settings.ENVIRONMENT,
            notification_channels=["dashboard", "email"],
            provider_status=cls._runtime_status(),
            updated_by=None,
            updated_at=None,
        )

    @classmethod
    def get_or_create_settings(cls, db: Session) -> PlatformSettingsModel:
        record = db.query(PlatformSettingsModel).filter(PlatformSettingsModel.id == 1).first()
        if record:
            return record

        defaults = cls._default_record()
        record = PlatformSettingsModel(
            id=1,
            ai_provider=defaults.ai_provider,
            embedding_provider=defaults.embedding_provider,
            ocr_provider=defaults.ocr_provider,
            confidence_threshold=defaults.confidence_threshold,
            top_k=defaults.top_k,
            rerank_top_k=defaults.rerank_top_k,
            enable_reranking=defaults.enable_reranking,
            theme=defaults.theme,
            notifications_enabled=defaults.notifications_enabled,
            api_base_url=defaults.api_base_url,
            environment_status=defaults.environment_status,
            notification_channels=defaults.notification_channels,
            provider_status=defaults.provider_status.model_dump(),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @classmethod
    def serialize(cls, record: PlatformSettingsModel) -> PlatformSettingsResponse:
        return PlatformSettingsResponse(
            ai_provider=record.ai_provider,
            embedding_provider=record.embedding_provider,
            ocr_provider=record.ocr_provider,
            confidence_threshold=record.confidence_threshold,
            top_k=record.top_k,
            rerank_top_k=record.rerank_top_k,
            enable_reranking=record.enable_reranking,
            theme=record.theme,
            notifications_enabled=record.notifications_enabled,
            api_base_url=record.api_base_url,
            environment_status=record.environment_status,
            notification_channels=record.notification_channels or [],
            provider_status=cls._runtime_status(),
            updated_by=record.updated_by,
            updated_at=record.updated_at,
        )

    @classmethod
    def get_settings_envelope(cls, db: Session) -> PlatformSettingsEnvelope:
        record = cls.get_or_create_settings(db)
        return PlatformSettingsEnvelope(
            settings=cls.serialize(record),
            available_ai_providers=cls.AVAILABLE_AI_PROVIDERS,
            available_embedding_providers=cls.AVAILABLE_EMBEDDING_PROVIDERS,
            available_ocr_providers=cls.AVAILABLE_OCR_PROVIDERS,
            effective_runtime={
                "ai_provider": settings.AI_PROVIDER,
                "ocr_provider": settings.OCR_PROVIDER,
                "qdrant_mode": settings.qdrant_mode,
                "environment": settings.ENVIRONMENT,
                "app_mode": settings.APP_MODE,
                "telemetry_enabled": settings.ENABLE_TELEMETRY,
                "embedding_dimension": settings.EMBEDDING_DIMENSION,
            },
        )

    @classmethod
    def update_settings(
        cls, db: Session, payload: PlatformSettingsUpdate, updated_by: str
    ) -> PlatformSettingsEnvelope:
        record = cls.get_or_create_settings(db)

        record.ai_provider = payload.ai_provider
        record.embedding_provider = payload.embedding_provider
        record.ocr_provider = payload.ocr_provider
        record.confidence_threshold = payload.confidence_threshold
        record.top_k = payload.top_k
        record.rerank_top_k = payload.rerank_top_k
        record.enable_reranking = payload.enable_reranking
        record.theme = payload.theme
        record.notifications_enabled = payload.notifications_enabled
        record.api_base_url = payload.api_base_url
        record.environment_status = payload.environment_status
        record.notification_channels = payload.notification_channels
        record.provider_status = cls._runtime_status().model_dump()
        record.updated_by = updated_by
        record.updated_at = datetime.now(timezone.utc)

        db.add(record)
        db.commit()
        db.refresh(record)
        return cls.get_settings_envelope(db)
