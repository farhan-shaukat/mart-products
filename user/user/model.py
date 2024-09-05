from sqlmodel import Field, SQLModel #type: ignore

class UserRegister(SQLModel, table = True):
    id: int | None = Field(default = None, primary_key = True)
    name: str = Field(max_length = 120)
    email: str = Field(max_length = 120)
    password: str = Field(max_length = 255)  
    PhoneNumber: str = Field(max_length = 20) 
    role: str = Field(default="User", max_length = 50)  
    Address: str = Field(max_length = 1500)
    Gender: str = Field(max_length = 12)
    imgUrl: str = Field(max_length = 300)
