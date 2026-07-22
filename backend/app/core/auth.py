import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.database.session import get_db_context
from app.models.blacklist import BlacklistedToken
from app.models.models import UserModel

# Crypt Context for hashing passwords securely
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration settings — MANDATE ENVIRONMENT VARIABLE LOADING (No hardcoded secrets)
JWT_SECRET = (
    os.environ.get("JWT_SECRET") or os.environ.get("JWT_SECRET_KEY") or settings.JWT_SECRET_KEY
)
if not JWT_SECRET:
    raise RuntimeError(
        "CRITICAL SECURITY ERROR: JWT_SECRET or JWT_SECRET_KEY environment variable is not configured!"
    )

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer()


def get_password_hash(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify standard plain password against hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate sign-secured JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Generate sign-secured JWT refresh token with unique jti identifier for rotation."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "jti": str(uuid.uuid4()), "refresh": True})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def blacklist_token(token: str):
    """Add a token to the blacklist."""
    with get_db_context() as db:
        blacklisted = BlacklistedToken(token=token)
        db.merge(blacklisted)


def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted."""
    with get_db_context() as db:
        exists = db.query(BlacklistedToken).filter(BlacklistedToken.token == token).first()
        return exists is not None


def decode_access_token(token: str) -> dict:
    """Decode, validate, and check expiration / blacklist for access tokens."""
    if is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been blacklisted / logged out",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # Verify Session ID matches database (if present in payload)
        sid = payload.get("sid")
        sub = payload.get("sub")
        if sid and sub:
            with get_db_context() as db:
                user = db.query(UserModel).filter(UserModel.username == sub).first()
                if user and user.current_session_id != sid:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Session has been revoked",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_payload(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """FastAPI Dependency to enforce active authorized bearer token."""
    token = credentials.credentials
    payload = decode_access_token(token)
    payload["token_str"] = token  # Attach raw token to request context for logout capability
    return payload


class RoleChecker:
    """FastAPI dependency to verify user authorization level (RBAC)."""

    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, payload: dict = Depends(get_current_user_payload)) -> dict:
        role = payload.get("role")
        if role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for current user level",
            )
        return payload
