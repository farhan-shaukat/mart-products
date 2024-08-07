from fastapi import APIRouter, Depends, HTTPException, status, Form,Query
from sqlmodel import Session, select
# from auth.model import User
from auth.database import get_session
from auth.auth_security import create_access_token, SECRET_KEY, ALGORITHM
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated,Dict
from jose import jwt, JWTError
import httpx

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def verify_user(username: str) -> Dict[str, str]:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"http://127.0.0.1:8002/get_latest_name/", params={"username": username})
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User Not Registered")
        
        response_data = response.json()
        user_name = response_data.get("name")
        password = response_data.get("password")

        if user_name is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found in response")
        
        return {"username": user_name, "password": password}
    
# @router.post("/register", response_model=User)
# async def register_user(
#     username: str = Form(...),
#     password: str = Form(...),
#     session: Session = Depends(get_session)
# ):
#     existing_user = session.exec(select(User).where(User.username == username)).first()
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Username already registered")

#     hashed_password = get_password_hash(password)
#     user_data = User(
#         username=username,
#         password=hashed_password
#     )

#     session.add(user_data)
#     session.commit()
#     session.refresh(user_data)
    
#     return user_data

# @router.post("/token")
# async def login(user: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_session)):
#     db_user = db.query(User).filter(User.username == user.username).first()
#     if not db_user or not verify_password(user.password, db_user.password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid username or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
#     access_token = create_access_token(data={"sub": user.username})
#     return {"access_token": access_token, "token_type": "bearer"}

@router.post("/user_token")
async def userLogin(user: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_session)):
    user_data = await verify_user(user.username) 
    
    if user.username != user_data['username'] or user.password != user_data['password']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/verify_token")
async def verify_token_api(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise JWTError
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
