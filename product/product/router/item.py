from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form,status
from sqlmodel import Session, select
from product.model import Product
from product.database import get_session
import os
from pydantic import EmailStr
from typing import List
from fastapi.security import OAuth2PasswordBearer
import httpx

router = APIRouter()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://127.0.0.1:8001/token")

async def verify_token(token: str = Depends(oauth2_scheme)):
    async with httpx.AsyncClient() as client:
        response = await client.get("http://127.0.0.1:8001/verify_token", headers={"Authorization": f"Bearer {token}"})
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(".", "Images", file.filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    complete_path = os.path.abspath(file_path)
    return  complete_path

@router.post("/Products/", response_model = Product, tags = ['Products'])
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    quantity: int = Form(...),
    price: float = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    token: str = Depends(verify_token)
):
    img_url = await upload_file(file)
    product = Product(
        name=name,
        description=description,
        quantity=quantity,
        price=price,
        imgUrl=img_url
    )
    
    session.add(product)
    session.commit()
    session.refresh(product)
    
    return product

@router.get("/products/", response_model = List[Product], tags = ['Products'])
async def read_products(session: Session = Depends(get_session)):
    statement = select(Product)
    products = session.exec(statement).all()
    return products

@router.put("/products/{id}", response_model = Product, tags = ['Products'])
async def update_product(
    id: int,
    name: str = Form(...),
    description: str = Form(...),
    quantity: int = Form(...),
    price: float = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    token: str = Depends(verify_token)
):
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code = 404, detail = "Product not found")

    img_url = await upload_file(file)

    product.name = name
    product.description = description
    product.quantity = quantity
    product.price = price
    product.imgUrl = img_url

    session.add(product)
    session.commit()
    session.refresh(product)
    
    return product

@router.delete("/products/{id}", response_model = dict, tags = ['Products'])
async def delete_product(
    id: int, 
    session: Session = Depends(get_session),
    token: str = Depends(verify_token)
):
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code = 404, detail = "Product not found")
    
    session.delete(product)
    session.commit()
    
    return {"detail": "Product deleted successfully","Product " : product}