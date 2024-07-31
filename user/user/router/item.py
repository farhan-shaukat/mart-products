from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from sqlmodel import Session, select ,or_
from user.model import UserRegister
from user.database import get_session
from typing import List
from supabase import create_client
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

router = APIRouter()

URL = os.getenv("URL")
API_KEY = os.getenv("API_KEY")
supabase = create_client(URL, API_KEY)

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

@router.post("/user_register/")
async def user_register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    Gender: str = Form(...),
    Address: str = Form(...),
    PhoneNumber: str = Form(...),
    file: UploadFile = File(None),
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
        password = password,
        Gender = Gender,
        Address = Address,
        PhoneNumber = PhoneNumber,
        imgUrl = image_url
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return  new_user

@router.get("/get_user/", response_model=UserRegister, tags=['User'])
async def read_latest_user(session: Session = Depends(get_session)):
    statement = select(UserRegister).order_by(UserRegister.id.desc()).limit(1)
    latest_user = session.exec(statement).first()
    return latest_user

