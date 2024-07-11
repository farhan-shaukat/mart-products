from fastapi import APIRouter, Depends, HTTPException
from models import Users
from database import engine, SessionLocal
from pydantic import BaseModel
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from typing import Annotated
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class createUserModel(BaseModel):
    email: str
    username: str
    password: str
    first_name: str
    last_name: str
    role: str

def AuthenticateUser(db: Session, username: str, password: str):
    user = db.query(Users).filter(Users.username == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/auth", status_code=status.HTTP_201_CREATED)
async def createUser(db: db_dependency, create_user_request: createUserModel):
    userInfo = Users(
        email = create_user_request.email,
        username = create_user_request.username,
        hashed_password = bcrypt_context.hash(create_user_request.password),
        first_name = create_user_request.first_name,
        last_name = create_user_request.last_name,
        role = create_user_request.role
    )

    db.add(userInfo)
    db.commit()

@router.post('/token')
async def getToken(userForm : Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):
    user = AuthenticateUser(db, userForm.username, userForm.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Credentials")
    return {
        "User Validated": "true",
    }