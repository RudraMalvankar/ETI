from fastapi import APIRouter, Depends, Query, status

from app.core.auth import RoleChecker
from app.services.compliance.AuditLogService import AuditLogService

router = APIRouter()

# Enforce Auditor & Admin role validation for checking security trails
auditor_check = RoleChecker(allowed_roles=["Auditor", "Admin"])


@router.get("/", status_code=status.HTTP_200_OK)
def list_audit_logs(
    limit: int = Query(default=100, lte=500),
    skip: int = Query(default=0, ge=0),
    current_user: dict = Depends(auditor_check),
):
    """Retrieve filtered paginated list of system audit actions."""
    logs = AuditLogService.get_logs(limit=limit, skip=skip)
    return [
        {
            "id": log.id,
            "username": log.username,
            "ip_address": log.ip_address,
            "action": log.action,
            "resource": log.resource,
            "previous_value": log.previous_value,
            "new_value": log.new_value,
            "timestamp": log.timestamp.isoformat(),
        }
        for log in logs
    ]
