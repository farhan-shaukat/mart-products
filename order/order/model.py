from sqlmodel import Field, SQLModel #type: ignore
from typing import List
from pydantic import BaseModel
class OrderRegister(SQLModel, table = True):
    id: int | None = Field(default = None, primary_key = True)
    userId: int = Field(nullable = False)
    productName: str = Field(max_length = 120, nullable = False)
    productQuantity: int = Field(nullable = False)
    productPrice: float = Field(nullable = False)
    totalPrice: float = Field(nullable = False, default = 0.0)
    status : str = Field(default = "Pending", max_length = 50)

class OrderCreateResponse(BaseModel):
    orders: List[OrderRegister]
    total_price: float