from sqlmodel import Field, SQLModel
from pydantic import EmailStr

class Product(SQLModel, table=True):
    id: int| None = Field(default=None, primary_key=True)
    name: str
    description: str
    quantity: int
    price: float
    imgUrl: str
