#router/user.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

from .. import models, schemas, authentication
from ..database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = authentication.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password=hashed_password,
        role="user"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = authentication.authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=authentication.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = authentication.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(authentication.get_current_active_user)):
    return current_user

@router.put("/me/password", response_model=schemas.User)
def update_password(
    password_update: schemas.PasswordUpdate,
    current_user: models.User = Depends(authentication.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Xác thực mật khẩu cũ trước khi cho phép đổi mật khẩu
    if not authentication.verify_password(password_update.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Đổi mật khẩu
    current_user.password = authentication.get_password_hash(password_update.new_password)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/email", response_model=schemas.User)
def update_email(
    email_update: schemas.EmailUpdate,
    current_user: models.User = Depends(authentication.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Kiểm tra xem email mới đã tồn tại chưa
    existing_email = db.query(models.User).filter(
        models.User.email == email_update.email,
        models.User.user_id != current_user.user_id
    ).first()
    
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Cập nhật email
    current_user.email = email_update.email
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/vocabulary", response_model=List[schemas.UserVocabulary])
def get_user_vocabulary(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(authentication.get_current_active_user),
    db: Session = Depends(get_db)
):
    user_vocabulary = db.query(models.UserVocabulary).filter(
        models.UserVocabulary.user_id == current_user.user_id
    ).offset(skip).limit(limit).all()
    return user_vocabulary