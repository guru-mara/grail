# app/models/trade.py
from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base

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