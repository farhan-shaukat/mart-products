from fastapi import Depends,APIRouter
from sqlmodel import Session
from app.models import CreateUser, AuthenticateUser, Product, Order, OrderTracking, StockLevel
from app.database import get_session, create_db_and_tables

router = APIRouter()

@router.on_event("startup")
def on_startup():
    create_db_and_tables()

@router.post("/UserRegister/", response_model=CreateUser)
def create_user(user: CreateUser, session: Session = Depends(get_session)):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/UserAuthencation/", response_model=AuthenticateUser)
def authenticate_user(user: AuthenticateUser, session: Session = Depends(get_session)):
    authenticated_user = session.query(AuthenticateUser).filter(CreateUser.email == user.email).first()
    return authenticated_user

@router.post("/Products/", response_model=Product)
def create_product(product: Product, session: Session = Depends(get_session)):
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.post("/Order/", response_model=Order)
def create_order(order: Order, session: Session = Depends(get_session)):
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

@router.get("/StockManagement/", response_model=list[StockLevel])
def stock_management(session: Session = Depends(get_session)):
    return session.query(StockLevel).all()

@router.get("/TrackOrder/", response_model=OrderTracking)
def track_order(order_id: int, session: Session = Depends(get_session)):
    return session.query(OrderTracking).filter(OrderTracking.orderId == order_id).first()

@router.get("/UserDetail/", response_model=AuthenticateUser)
def user_detail(session: Session = Depends(get_session)):
    return session.query(AuthenticateUser)

@router.get("/OrderDetail/", response_model=Order)
def order_detail(order_id: int, session: Session = Depends(get_session)):
    return session.query(Order).filter(Order.orderId == order_id).first()

@router.get("/ProductDetail/", response_model=Product)
def product_detail(session: Session = Depends(get_session)):
    return session.query(Product)
