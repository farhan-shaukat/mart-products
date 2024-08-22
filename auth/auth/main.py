from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.router.item import router

app = FastAPI()

app.include_router(router)
origin = [
    "http://localhost:3000",  
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8002" ,
    "http://localhost:8002" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)