from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Annotated

import src.database.models as models
from src.database.db import db_dependency
from src.auth.auth_dependencies import oauth2_scheme
from src.auth.auth_models import Token, UserOut, UserCreate, UserOutWithToken, UserLogin
from src.auth.auth_utils import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

authRouter = APIRouter(
    prefix="/api",
    tags=["auth"],
)

@authRouter.post("/auth/token", response_model=Token, summary="Для внутреннего использования в swagger")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency
):
    db_user = authenticate_user(db, form_data.username, form_data.password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token, access_token_expire = create_access_token(
        data={"sub": str(db_user.email)}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": db_user.email})
  
    # Сохраняем токены и их сроки действия в базу данных
    db_user.access_token = access_token
    db_user.expires_at = access_token_expire
    db_user.refresh_token = refresh_token
    db.commit()
    
    return Token(
        access_token=access_token,
        expires_at=access_token_expire,
        refresh_token=refresh_token
    )

@authRouter.post("/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: db_dependency):
    # Проверка, существует ли пользователь с таким же email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким e-mail уже существует",
        )

    hashed_password = get_password_hash(user.password)
    
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return UserOut(
        username=db_user.username,
        email=db_user.email,
        password=user.password
    )

@authRouter.post("/auth/login", response_model=UserOutWithToken, status_code=status.HTTP_200_OK)
async def login_user(user: UserLogin, db: db_dependency):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token, access_token_expire = create_access_token(
        data={"sub": str(db_user.email)}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": str(db_user.email)})

    db_user.access_token = access_token
    db_user.expires_at = access_token_expire
    db_user.refresh_token = refresh_token
    db.commit()
    
    return UserOutWithToken(
        user_id=str(db_user.user_id),
        username=db_user.username,
        email=db_user.email,
        token=Token(
            access_token=access_token,
            expires_at=access_token_expire,
            refresh_token=refresh_token
        ),
    )

@authRouter.post("/auth/refresh", response_model=Token)
async def refresh_token(db: db_dependency, token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недопустимый токен обновления",
        )

    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недопустимый токен обновления",
        )
    
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token, access_token_expire = create_access_token(
        data={"sub": email}, expires_delta=access_token_expires
    )

    db_user.access_token = access_token
    db_user.expires_at = access_token_expire
    db_user.refresh_token = token
    db.commit()

    return Token(
        access_token=access_token,
        expires_at=access_token_expire,
        refresh_token=token
    )