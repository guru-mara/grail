# app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.routes import accounts, trades, templates
from app.models import models
from app.database import engine, get_db

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gold Trading Journal API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    # Add any other origins you might need in the future
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
# Remove the auth router
app.include_router(accounts.router, prefix="/api/accounts", tags=["Trading Accounts"])
app.include_router(trades.router, prefix="/api/trades", tags=["Trades"])
app.include_router(templates.router, prefix="/api/templates", tags=["Templates"])

@app.get("/")
def read_root():
    return {"message": "Gold Trading Journal API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Gold Trading Journal API"}