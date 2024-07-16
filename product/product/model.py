from sqlmodel import Field, SQLModel

class Product(SQLModel, table=True):
    id: int| None = Field(default=None, primary_key=True)
    name: str
    description: str 
    quantity: int
    price: float
    imgUrl: str
