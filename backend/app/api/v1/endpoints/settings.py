from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import RoleChecker
from app.database.session import get_db
from app.schemas.settings import PlatformSettingsEnvelope, PlatformSettingsUpdate
from app.services.settings_service import SettingsService

router = APIRouter()

settings_read_check = RoleChecker(allowed_roles=["Operator", "Engineer", "Auditor", "Admin"])
settings_write_check = RoleChecker(allowed_roles=["Admin"])


@router.get("/", response_model=PlatformSettingsEnvelope, status_code=status.HTTP_200_OK)
def get_platform_settings(
    db: Session = Depends(get_db), current_user: dict = Depends(settings_read_check)
):
    return SettingsService.get_settings_envelope(db)


@router.put("/", response_model=PlatformSettingsEnvelope, status_code=status.HTTP_200_OK)
def update_platform_settings(
    payload: PlatformSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(settings_write_check),
):
    return SettingsService.update_settings(db, payload, current_user.get("sub", "system"))
