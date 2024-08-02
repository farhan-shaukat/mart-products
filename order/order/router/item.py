from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlmodel import Session, select
from order.model import OrderRegister, OrderCreateResponse
from order.database import get_session
from typing import List
import httpx
from fastapi.security import OAuth2PasswordBearer

async def verify_user() -> int:
    async with httpx.AsyncClient() as client:
        response = await client.get("http://127.0.0.1:8002/get_user/")
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User Not Registered")
        
        response_data = response.json()
        user_id =  response_data['id']
        
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in response")
        
        return user_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://127.0.0.1:8001/user_token")

async def verify_token(token: str = Depends(oauth2_scheme)):
    async with httpx.AsyncClient() as client:
        response = await client.get("http://127.0.0.1:8001/verify_token", headers={"Authorization": f"Bearer {token}"})
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

router = APIRouter()

@router.post("/Order_create/", response_model=OrderCreateResponse, tags=['Order'])
async def Order_create(
    products: List[dict] = Body(...),
    session: Session = Depends(get_session),
    userIdGet: int = Depends(verify_user),
    token: str = Depends(verify_token)
):
    userId = userIdGet
    orders = []
    
    for product in products:
        productName = product.get("productName")
        productQuantity = product.get("productQuantity")
        productPrice = product.get("productPrice")

        if not all([productName, productQuantity, productPrice]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing product information")

        order_total_price = productQuantity * productPrice

        new_order = OrderRegister(
            userId=userId,
            productName=productName,
            productQuantity=productQuantity,
            productPrice=productPrice,
            totalPrice=order_total_price
        )
        
        session.add(new_order)
        orders.append(new_order)

    try:
        session.commit()
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    total_price = sum(order.totalPrice for order in orders)

    order_list = [
        {
            "userId": order.userId,
            "productName": order.productName,
            "productQuantity": order.productQuantity,
            "productPrice": order.productPrice,
            "totalPrice": order.totalPrice
        }
        for order in orders
    ]

    return {"orders": order_list, "total_price": total_price}

@router.get("/get_order", response_model = OrderCreateResponse, tags=["Order"])
async def get_order(
    # userId: int = Depends(verify_user), 
    session: Session = Depends(get_session)):
    # orders = session.exec(select(OrderRegister).where(OrderRegister.userId == userId)).all()
    orders = session.exec(select(OrderRegister))

    if not orders:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No orders found for the user")

    order_list = [
        {
            "userId": order.userId,
            "productName": order.productName,
            "productQuantity": order.productQuantity,
            "productPrice": order.productPrice,
            "totalPrice": order.totalPrice
        }
        for order in orders
    ]
    total_price = sum(order["totalPrice"] for order in order_list)

    return {"orders": order_list, "total_price": total_price}
