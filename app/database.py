# database.py
from sqlmodel import create_engine, Session, SQLModel

DATABASE_URL = "postgresql+psycopg2://postgres:12345@localhost:5432/ShoppingMall"


# Create the database engine
engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()

# Function to create tables
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    print("TABLE CREATED")
    print(engine)

create_db_and_tables()

