from sqlmodel import Field, SQLModel #type: ignore


class Category(SQLModel, table=True):
    id: int = Field(default = None, primary_key = True)
    name: str = Field(max_length=200)
    imgUrl : str = Field(max_length=200)

class Product(SQLModel, table = True):
    id: int = Field(default = None, primary_key = True)
    name: str = Field(max_length=200)
    description: str = Field(max_length=200)
    category : str = Field(max_length=200)
    quantity: int
    price: float
    imgUrl: str = Field(max_length=200)

