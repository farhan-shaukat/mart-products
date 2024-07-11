from sqlmodel import Field, SQLModel, Relationship, Session
from pydantic import EmailStr
from typing import Optional


class CreateUser(SQLModel, table=True):
    userid: int | None = Field(default=None, primary_key=True)
    username: str
    email: EmailStr
    password: str
    gender: str
    address: str
    imgUrl: str

class Product(SQLModel, table=True):
    id: int| None = Field(default=None, primary_key=True)
    name: str
    description: str
    quantity: int
    price: float
    imgUrl: str

class OrderTable(SQLModel, table=True):
    userId: int  = Field(foreign_key="createuser.userid")
    orderId: int |None = Field(default=None, primary_key=True)
    productId: int = Field(foreign_key="product.id")
    quantity: int
    productPrice: float
    # total_price: float = Field(default=None)

    # @property
    # def calculate_total_price(self):
    #     self.total_price = self.quantity * self.productPrice

class OrderTracking(SQLModel, table=True):
    orderId: int = Field(foreign_key="ordertable.orderId")
    trackingId: int  | None = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="createuser.userid")
    latitude : float
    longitude : float
    status  : str

class StockLevel(SQLModel, table=True):
    id: int |None = Field(default=None, primary_key=True)
    productId: int = Field(foreign_key="product.id")
    quantity: int

def update_stock_level(session: Session, product_id: int, quantity: int):
    product = session.get(Product, product_id)
    if product:
        stock_level = session.query(StockLevel).filter_by(productId=product_id).first()
        if stock_level:
            stock_level.quantity += quantity
        else:
            stock_level = StockLevel(productId=product_id, quantity=quantity)
            session.add(stock_level)
        session.commit()