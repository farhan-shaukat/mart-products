from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Query, status
from sqlmodel import Session, select, or_ #type: ignore
from user.model import UserRegister
from user.database import get_session
from typing import List
from supabase import create_client #type: ignore
import os
from dotenv import load_dotenv
import uuid
from passlib.context import CryptContext #type: ignore
from confluent_kafka import Consumer, KafkaError #type: ignore
import asyncio
import logging

load_dotenv()
pwd_password = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

URL = os.getenv("URL")
API_KEY = os.getenv("API_KEY")
supabase = create_client(URL, API_KEY)

logging.basicConfig(level=logging.INFO)

def get_password_hash(password: str) -> str:
    return pwd_password.hash(password)

async def upload_file(file: UploadFile) -> str:
    bucket_name = "UserImages"
    file_content = await file.read()
    original_filename = file.filename
    unique_filename = original_filename

    # Check if the file exists and change the name if necessary
    existing_file = supabase.storage.from_(bucket_name).get_public_url(original_filename)
    if existing_file:
        unique_filename = f"{uuid.uuid4().hex}_{original_filename}"

    response = supabase.storage.from_(bucket_name).upload(unique_filename, file_content)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="File upload failed")

    public_url = supabase.storage.from_(bucket_name).get_public_url(unique_filename)
    return public_url

@router.post("/user_register/", response_model=UserRegister, tags=["User"])
async def user_register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    Gender: str = Form(...),
    Address: str = Form(...),
    PhoneNumber: str = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    existing_user = session.exec(select(UserRegister).where(
        or_(UserRegister.name == name, UserRegister.email == email)
    )).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="UserName and Email already registered")
    
    image_url = None
    if file:
        image_url = await upload_file(file)

    new_user = UserRegister(
        name = name,
        email = email,
        password = get_password_hash(password),
        Gender = Gender,
        Address = Address,
        PhoneNumber = PhoneNumber,
        imgUrl = image_url
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@router.put("/user_update/{id}", response_model = UserRegister, tags = ['User'])
async def user_update(
    id: int,
    name: str = Form(...),
    email: str = Form(...),
    Gender: str = Form(...),
    Address: str = Form(...),
    PhoneNumber: str = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    existing_User = session.get(UserRegister, id)
    if not existing_User:
        raise HTTPException(status_code=404, detail="User not found")

    if file:
        img_url = await upload_file(file)
        existing_User.imgUrl = img_url

    existing_User.name = name
    existing_User.email = email
    existing_User.Gender = Gender
    existing_User.Address = Address
    existing_User.PhoneNumber = PhoneNumber

    session.add(existing_User)
    session.commit()
    session.refresh(existing_User)

    return existing_User

@router.get("/get_latest_name/", response_model=UserRegister, tags=['User'])
async def read_latest_name(username: str = Query(...), session: Session = Depends(get_session)):
    statement = select(UserRegister).where(UserRegister.name == username)
    latest_user = session.exec(statement).first()
    if not latest_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{username} not Found")
    return latest_user

@router.get("/get_user/", response_model = List[UserRegister], tags = ['User'])
async def read_user(session: Session = Depends(get_session)):
    statement = select(UserRegister)
    user = session.exec(statement).all()
    return user

# Kafka Consumer Configuration
consumer_config = {
    'bootstrap.servers': '192.168.18.20:9092', 
    'group.id': 'user-service-group',
    'auto.offset.reset': 'earliest'
}
consumer = Consumer(**consumer_config)

@router.on_event("startup")
async def startup_event():
    asyncio.create_task(consume_messages())

async def consume_messages():
    consumer.subscribe(['user-login-topic'])

    while True:
        msg = consumer.poll(1.0)  # Timeout set to 1 second
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            else:
                print(f"\n\nConsumer error: {msg.error()}\n\n")
                break

        username = msg.value().decode("utf-8")
        print(f'\n\nReceived message for user: {username}\n\n')
        
        # Processing Logic: Log user login activity
        session = next(get_session())  # Obtain a new session

        # Retrieve the user record from the database
        statement = select(UserRegister).where(UserRegister.name == username)
        user = session.exec(statement).first()

        if user:
            session.add(user)
            session.commit()
            print(f"\n\nUpdated last login for user: {username}\n\n")
        else:
            print(f"\n\nUser {username} not found in the database\n\n")
