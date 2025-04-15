# app/models/models.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    accounts = relationship("Account", back_populates="owner", cascade="all, delete-orphan")

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

class TradeDirection(str, enum.Enum):
    LONG = "long"
    SHORT = "short"

class TradeStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"

class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    instrument = Column(String, default="XAUUSD")
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=True)
    position_size = Column(Float, nullable=False)
    direction = Column(Enum(TradeDirection), nullable=False)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    entry_date = Column(DateTime(timezone=True), server_default=func.now())
    exit_date = Column(DateTime(timezone=True), nullable=True)
    pre_analysis = Column(Text, nullable=True)
    post_analysis = Column(Text, nullable=True)
    result = Column(Float, nullable=True)
    status = Column(Enum(TradeStatus), default=TradeStatus.OPEN)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    account = relationship("Account", back_populates="trades")