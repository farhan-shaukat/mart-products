from sqlmodel import Field, SQLModel

class Product(SQLModel, table=True):
    id: int| None = Field(default=None, primary_key=True)
    name: str = Field(sa_column_kwargs={"max_length": 200})
    description: str = Field(sa_column_kwargs={"max_length": 1200})
    quantity: int
    price: float
    imgUrl: str = Field(sa_column_kwargs={"max_length": 300})

