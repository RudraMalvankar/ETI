from datetime import UTC, datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, String

from app.database.session import Base


class RunbookModel(Base):
    __tablename__ = "runbooks"

    runbook_id = Column(String(100), primary_key=True, index=True)
    failed_asset = Column(String(100), nullable=False)
    failure_type = Column(String(100), nullable=False)
    steps = Column(JSON, default=list)
    status = Column(String(50), default="active")
    is_regenerated = Column(Boolean, default=False)
    update_history = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))


class SimulationModel(Base):
    __tablename__ = "simulations"

    simulation_id = Column(String(100), primary_key=True, index=True)
    failed_asset = Column(String(100), nullable=False)
    failure_type = Column(String(100), nullable=False)
    scenarios = Column(JSON, default=list)
    initial_telemetry = Column(JSON, default=dict)
    operating_mode = Column(String(50), default="normal")
    request_timestamp = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
