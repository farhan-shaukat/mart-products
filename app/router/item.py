from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models import CreateUser, Product, OrderTable, OrderTracking, StockLevel
from app.database import get_session

router = APIRouter()

@router.post("/UserRegister/", response_model=CreateUser)
async def create_user(user: CreateUser, session: Session = Depends(get_session)):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/Products/", response_model=Product)
async def create_product(product: Product, session: Session = Depends(get_session)):
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.post("/Order/", response_model=OrderTable)
async def create_order(order: OrderTable, session: Session = Depends(get_session)):
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

@router.post("/OrderTrack/",response_model=OrderTracking)
async def create_order_track(order_track: OrderTracking, session: Session = Depends(get_session)):
    latest_order = session.exec(select(OrderTable).order_by(OrderTable.orderId.desc())).first()
    if not latest_order:
        raise HTTPException(status_code=404, detail="No orders found to track")
    order_track.orderId = latest_order.orderId

    session.add(order_track)
    session.commit()
    session.refresh(order_track)
    return order_track



@router.get("/StockManagement/", response_model=list[StockLevel])
async def stock_management(session: Session = Depends(get_session)):
    statement = select(StockLevel)
    results = session.exec(statement)
    return results.all()

@router.get("/TrackOrder/", response_model=OrderTracking)
async def track_order(order_id: int, session: Session = Depends(get_session)):
    statement = select(OrderTracking).where(OrderTracking.orderId == order_id)
    result = session.exec(statement).first()
    if not result:
        raise HTTPException(status_code=404, detail="Order not found")
    return result

@router.get("/UserDetail/", response_model=CreateUser)
async def user_detail(session: Session = Depends(get_session)):
    statement = select(CreateUser)
    result = session.exec(statement).first()
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result

@router.get("/OrderDetail/", response_model=OrderTable)
async def order_detail(order_id: int, session: Session = Depends(get_session)):
    statement = select(OrderTable).where(OrderTable.orderId == order_id)
    result = session.exec(statement).first()
    if not result:
        raise HTTPException(status_code=404, detail="Order not found")
    return result

@router.get("/ProductDetail/", response_model=Product)
async def product_detail(session: Session = Depends(get_session)):
    statement = select(Product)
    result = session.exec(statement).first()
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return result
