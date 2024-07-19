from sqlmodel import Field, SQLModel
class User(SQLModel,table=True):
    id : int | None = Field(default=None,primary_key = True)
    username: str = Field(sa_column_kwargs={"max_length": 200})
    password: str = Field(sa_column_kwargs={"max_length": 10})

