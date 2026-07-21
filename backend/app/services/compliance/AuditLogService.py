from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional, Any
from app.models.audit import AuditLogModel
from app.database.session import SessionLocal

class AuditLogService:
    """
    Centralized service class handling enterprise audit logging operations.
    """
    @classmethod
    def log(
        cls,
        action: str,
        resource: str,
        username: str = "Anonymous",
        ip_address: Optional[str] = None,
        previous_value: Optional[Any] = None,
        new_value: Optional[Any] = None
    ) -> AuditLogModel:
        db = SessionLocal()
        try:
            entry = AuditLogModel(
                username=username,
                ip_address=ip_address,
                action=action,
                resource=resource,
                previous_value=previous_value,
                new_value=new_value,
                timestamp=datetime.now(timezone.utc)
            )
            db.add(entry)
            db.commit()
            db.refresh(entry)
            return entry
        finally:
            db.close()

    @classmethod
    def get_logs(cls, limit: int = 100, skip: int = 0) -> List[AuditLogModel]:
        db = SessionLocal()
        try:
            return db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).offset(skip).limit(limit).all()
        finally:
            db.close()
