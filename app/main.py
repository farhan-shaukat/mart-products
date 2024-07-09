from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables
from .router import item  

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    create_db_and_tables()

app.include_router(item.router) 