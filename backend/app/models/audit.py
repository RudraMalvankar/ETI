from sqlalchemy import Column, String, Integer, DateTime, JSON
from datetime import datetime, timezone
from app.database.session import Base

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), index=True, default="Anonymous")
    ip_address = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(200), nullable=False)
    previous_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
