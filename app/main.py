# app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.routes import auth, accounts, trades
from app.models import models
from app.database import engine, get_db

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gold Trading Journal API")

# Configure CORS
origins = [
    "http://localhost:3000",  # React frontend
    "http://localhost:8000",  # For development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Trading Accounts"])
app.include_router(trades.router, prefix="/api/trades", tags=["Trades"])

@app.get("/")
def read_root():
    return {"message": "Gold Trading Journal API"}