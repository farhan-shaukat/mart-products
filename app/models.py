from sqlmodel import Field, SQLModel, Relationship, Session, ForeignKey
from pydantic import EmailStr
from typing import List,Optional

class CreateUser(SQLModel, table=True):
    userid: int = Field(default=None, primary_key=True)
    username: str
    email: EmailStr
    password: str
    gender: str
    address: str
    fileName: str
    url: str

class Product(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    description: str
    quantity: int
    price: float
    fileName: str
    url: str

class OrderTable(SQLModel, table=True):
    userId: int = Field(foreign_key="createuser.userid")
    orderId: int = Field(default=None, primary_key=True)
    productId: int = Field(foreign_key="product.id")
    quantity: int
    productPrice: float
    total_price: float = Field(default=None)
    order_tracking: Optional["OrderTracking"] = Relationship(back_populates="order")

    @property
    def calculate_total_price(self):
        self.total_price = self.quantity * self.productPrice

class OrderTracking(SQLModel, table=True):
    orderId: int = Field(foreign_key="ordertable.orderId")
    trackingId: int = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="createuser.userid")
    latitude : float
    longitude : float
    order: Optional["OrderTable"] = Relationship(back_populates="order_tracking")

class StockLevel(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
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
