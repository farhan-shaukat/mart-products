from sqlmodel import create_engine, Session, SQLModel #type: ignore

from dotenv import load_dotenv
import os 

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


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

create_db_and_tables()
