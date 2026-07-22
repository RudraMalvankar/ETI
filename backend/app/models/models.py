from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Column, DateTime, Integer, String

from app.database.session import Base


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(50), default="Operator")  # Operator, Engineer, Auditor
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    current_session_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class DocumentModel(Base):
    __tablename__ = "documents"

    document_id = Column(String(100), primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)
    status = Column(String(50), default="pending")
    chunks = Column(JSON, default=list)  # Store structured parsed chunks
    error_message = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class IncidentModel(Base):
    __tablename__ = "incidents"

    incident_id = Column(String(100), primary_key=True, index=True)
    failed_asset = Column(String(100), index=True, nullable=False)
    failure_type = Column(String(100), nullable=False)
    graph_snapshot = Column(JSON, default=dict)
    simulation_data = Column(JSON, default=dict)
    decision_data = Column(JSON, default=dict)
    runbook_history = Column(JSON, default=list)
    technician_feedback = Column(JSON, default=list)
    regenerated_runbooks = Column(JSON, default=list)
    outcome = Column(String(100), default="Resolved")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class PlatformSettingsModel(Base):
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True, default=1)
    ai_provider = Column(String(50), nullable=False, default="gemini")
    embedding_provider = Column(String(50), nullable=False, default="nim")
    ocr_provider = Column(String(50), nullable=False, default="nim")
    confidence_threshold = Column(Integer, nullable=False, default=85)
    top_k = Column(Integer, nullable=False, default=10)
    rerank_top_k = Column(Integer, nullable=False, default=5)
    enable_reranking = Column(Boolean, nullable=False, default=True)
    theme = Column(String(20), nullable=False, default="dark")
    notifications_enabled = Column(Boolean, nullable=False, default=True)
    api_base_url = Column(String(255), nullable=False, default="")
    environment_status = Column(String(50), nullable=False, default="development")
    notification_channels = Column(JSON, default=list)
    provider_status = Column(JSON, default=dict)
    updated_by = Column(String(100), nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
