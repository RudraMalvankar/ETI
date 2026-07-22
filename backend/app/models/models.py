from datetime import datetime, timezone

from sqlalchemy import JSON, Column, DateTime, Integer, String

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
