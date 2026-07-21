from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime, timezone, timedelta
import uuid
from app.database.session import get_db
from app.models.models import UserModel
from app.core.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user_payload,
    blacklist_token,
    is_token_blacklisted,
    decode_access_token
)

router = APIRouter()

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: str = Field(default="Operator")

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str

class UserProfile(BaseModel):
    username: str
    role: str

class RefreshRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    username: str
    new_password: str = Field(..., min_length=6)

@router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
def register(request: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(UserModel).filter(UserModel.username == request.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    hashed_pwd = get_password_hash(request.password)
    user = UserModel(
        username=request.username,
        hashed_password=hashed_pwd,
        role=request.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserProfile(username=user.username, role=user.role)

@router.post("/login", response_model=Token)
def login(request: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.username == request.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Check for Account Lockout
    now = datetime.now(timezone.utc)
    if user.locked_until:
        # Check if locked_until has a timezone, if not localize or compare properly
        locked_until_utc = user.locked_until
        if locked_until_utc.tzinfo is None:
            locked_until_utc = locked_until_utc.replace(tzinfo=timezone.utc)
        if now < locked_until_utc:
            minutes_left = int((locked_until_utc - now).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is temporarily locked. Try again in {minutes_left} minutes."
            )

    if not verify_password(request.password, user.hashed_password):
        # Tracking Failed Login
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = now + timedelta(minutes=LOCKOUT_MINUTES)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account locked due to too many failed attempts. Locked for {LOCKOUT_MINUTES} minutes."
            )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Success: Reset failed attempts & generate sessions
    user.failed_login_attempts = 0
    user.locked_until = None
    session_id = str(uuid.uuid4())
    user.current_session_id = session_id
    db.commit()

    # Generate Access + Refresh Token
    access_token = create_access_token(data={"sub": user.username, "role": user.role, "sid": session_id})
    refresh_token = create_refresh_token(data={"sub": user.username, "role": user.role, "sid": session_id})

    # Secure Cookie Support
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=3600
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role=user.role
    )

@router.post("/refresh", response_model=Token)
def refresh_token_rotation(request: RefreshRequest, response: Response, db: Session = Depends(get_db)):
    """Token Rotation endpoint."""
    token = request.refresh_token
    if is_token_blacklisted(token):
        raise HTTPException(status_code=401, detail="Refresh token has been blacklisted")

    payload = decode_access_token(token)
    if not payload.get("refresh"):
        raise HTTPException(status_code=401, detail="Invalid token type for refresh")

    # Access sub and validation
    username = payload.get("sub")
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user or user.current_session_id != payload.get("sid"):
        raise HTTPException(status_code=401, detail="Session has been revoked")

    # Rotate tokens: Blacklist old refresh token
    blacklist_token(token)

    # Generate new pair
    session_id = str(uuid.uuid4())
    user.current_session_id = session_id
    db.commit()

    new_access = create_access_token(data={"sub": user.username, "role": user.role, "sid": session_id})
    new_refresh = create_refresh_token(data={"sub": user.username, "role": user.role, "sid": session_id})

    # Set new secure cookie
    response.set_cookie(
        key="access_token",
        value=new_access,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=3600
    )

    return Token(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        role=user.role
    )

@router.post("/logout")
def logout(response: Response, payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    """Logs out user, invalidates active JWT, and deletes secure cookies."""
    token = payload.get("token_str")
    if token:
        blacklist_token(token)

    # Nullify current session in db
    username = payload.get("sub")
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if user:
        user.current_session_id = None
        db.commit()

    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

@router.post("/reset-password")
def reset_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Password Reset workflow."""
    user = db.query(UserModel).filter(UserModel.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(request.new_password)
    user.current_session_id = None  # Session Revocation on password change
    db.commit()
    return {"message": "Password updated successfully and all active sessions revoked"}

@router.get("/me", response_model=UserProfile)
def get_me(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    username = payload.get("sub")
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfile(username=user.username, role=user.role)

