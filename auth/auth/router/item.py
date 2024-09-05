from fastapi import APIRouter, Depends, HTTPException, status, Form, Query
from sqlmodel import Session #type: ignore
from auth.database import get_session
from auth.auth_security import create_access_token, SECRET_KEY, ALGORITHM
from passlib.context import CryptContext #type: ignore
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated, Dict
from jose import jwt, JWTError #type: ignore
import httpx
from confluent_kafka import Producer #type: ignore

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Configuration Kafka Producer
producer_config = {
    'bootstrap.servers': '192.168.18.20:9092',
}

producer = Producer(**producer_config)

def message_delivery_report(error, message):
    """ Called once for each message produced to indicate delivery result. """
    if error is not None:
        print(f"\n\nFailed to deliver message: {error}\n\n")
    else:
        print(f"\n\nMessage delivered to {message.topic()} [{message.partition()}]\n\n")

# Hash the password
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Verify the password against the hash
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def verify_user(username: str) -> Dict[str, str]:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"http://user-service:8002/get_latest_name/", params={"username": username})
            response.raise_for_status()  # Raises an HTTPError for bad responses
        except httpx.RequestError as e:
            print(f"Request Error: {e}")  # Log the request error
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Service unavailable: {str(e)}")
        except httpx.HTTPStatusError as e:
            print(f"HTTP Status Error: {e}")  # Log HTTP status errors
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Service error: {str(e)}")

        response_data = response.json()
        user_name = response_data.get("name")
        password = response_data.get("password")

        if user_name is None or password is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found in response")

        return {"username": user_name, "password": password}

# Function for user authentication
async def authenticate_user(user: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Dict[str, str]:
    user_data = await verify_user(user.username)
    if not (user.username == user_data["username"] and verify_password(user.password, user_data["password"])):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_data

# Route to handle login and token generation
@router.post("/token")
async def login(user: Annotated[OAuth2PasswordRequestForm, Depends()]):
    await authenticate_user(user)
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Additional login route for user token generation
@router.post("/user_token")
async def user_login(user: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user_data = await authenticate_user(user)
    # Produce a Kafka message when the user logs in successfully
    producer.produce('user-login-topic', user_data['username'].encode('utf-8'), callback = message_delivery_report)
    producer.flush()
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Route to verify the token
@router.get("/verify_token")
async def verify_token_api(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
         # Produce a Kafka message when the user logs in successfully
        producer.produce('add-product-category', username, callback = message_delivery_report)
        producer.flush()
        if username is None:
            raise JWTError
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
