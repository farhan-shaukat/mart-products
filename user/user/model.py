from sqlmodel import Field, SQLModel

class UserRegister(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=120)
    email: str = Field(max_length=120)
    password: str = Field(max_length=16)
    PhoneNumber: str = Field(max_length=16)
    Address: str = Field(max_length=1500)
    Gender: str = Field(max_length=12)
    imgUrl: str = Field(max_length=300)
