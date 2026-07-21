from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.database.session import get_db
from app.models.models import UserModel
from app.core.auth import get_password_hash, verify_password, create_access_token, get_current_user_payload

router = APIRouter()

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: str = Field(default="Operator")

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserProfile(BaseModel):
    username: str
    role: str

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
def login(request: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return Token(access_token=access_token, token_type="bearer", role=user.role)

@router.get("/me", response_model=UserProfile)
def get_me(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    username = payload.get("sub")
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfile(username=user.username, role=user.role)
