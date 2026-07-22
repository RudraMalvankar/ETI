from datetime import datetime, timezone
from typing import Any, List, Optional

from app.database.session import get_db_context
from app.models.audit import AuditLogModel


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
        new_value: Optional[Any] = None,
    ) -> AuditLogModel:
        with get_db_context() as db:
            entry = AuditLogModel(
                username=username,
                ip_address=ip_address,
                action=action,
                resource=resource,
                previous_value=previous_value,
                new_value=new_value,
                timestamp=datetime.now(timezone.utc),
            )
            db.add(entry)
            db.flush()
            db.refresh(entry)
            db.expunge(entry)
            return entry

    @classmethod
    def get_logs(cls, limit: int = 100, skip: int = 0) -> List[AuditLogModel]:
        with get_db_context() as db:
            logs = (
                db.query(AuditLogModel)
                .order_by(AuditLogModel.timestamp.desc())
                .offset(skip)
                .limit(limit)
                .all()
            )
            for item in logs:
                db.expunge(item)
            return logs
