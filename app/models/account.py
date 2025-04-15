# app/models/accounts.py
from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    account_name = Column(String, index=True)
    broker_name = Column(String)
    initial_balance = Column(Float)
    current_balance = Column(Float)
    account_type = Column(String, default="Personal")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="accounts")
    trades = relationship("Trade", back_populates="account", cascade="all, delete-orphan")