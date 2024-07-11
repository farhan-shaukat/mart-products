from fastapi import APIRouter, Depends, HTTPException,File,UploadFile,Form
from sqlmodel import Session, select
from app.models import CreateUser, Product, OrderTable, OrderTracking, StockLevel
from app.database import get_session
import os

router = APIRouter()

@router.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(".", "Images", file.filename)
    # Ensure the directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    # Write the file
    with open(file_path, "wb") as f:
        f.write(file.file.read())
        print(file_path)
    # Get the compolete path
    complete_path = os.path.abspath(file_path)
    return complete_path

@router.post("/UserRegister/", response_model=CreateUser)
async def create_user(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    gender: str = Form(...),
    address: str = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    
    img_url = await upload_file(file)
    user_data = CreateUser(
        username = username,
        email = email,
        password = password,
        gender = gender,
        address = address,
        imgUrl = img_url
    )
    
    db_user = CreateUser(**user_data.dict())
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return db_user

@router.post("/Products/", response_model=Product)
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    quantity: int = Form(...),
    price: float = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    img_url = await upload_file(file)
    product = Product(
        name = name,
        description = description,
        quantity = quantity,
        price = price,
        imgUrl = img_url
    )
    
    db_prod = Product(**product.dict())
    
    session.add(db_prod)
    session.commit()
    session.refresh(db_prod)
    
    return db_prod


@router.post("/Order/", response_model=OrderTable)
async def create_order(
    userId: int = Form(...) ,
    productId: int = Form(...),
    quantity: int = Form(...),
    productPrice: float = Form(...),
    session: Session = Depends(get_session)
):
    order = OrderTable(
        userId = userId,
        productId = productId,
        quantity = quantity,
        productPrice = productPrice
    )
    
    db_order = OrderTable(**order.dict())
    
    session.add(db_order)
    session.commit()
    session.refresh(db_order)
    
    return db_order

@router.post("/OrderTrack/", response_model=OrderTracking)
async def create_order_track(
    status: str = Form(...),
    location: str = Form(...),
    orderId: int = Form(...),
    userId: int = Form(...),
    latitude : float = Form(...),
    longitude : float = Form(...),
    session: Session = Depends(get_session)
):

    order_track = OrderTracking(
        userId = userId,
        orderId = orderId,
        status = status,
        location = location,
        latitude = latitude,
        longitude = longitude
    )

    db_order_track = OrderTracking(**order_track.dict())
    
    session.add(db_order_track)
    session.commit()
    session.refresh(db_order_track)
    return db_order_track


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
