# app/schemas/trade.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class TradeDirection(str, Enum):
    LONG = "long"
    SHORT = "short"

class TradeStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"

class PreAnalysisBase(BaseModel):
    daily_trend: Optional[str] = None
    clean_range: Optional[bool] = False
    volume_time: Optional[str] = None
    previous_session_volume: Optional[bool] = False
    htf_setup: Optional[str] = None
    ltf_confirmation: Optional[str] = None
    notes: Optional[str] = None

class PostAnalysisBase(BaseModel):
    notes: Optional[str] = None
    rating: Optional[int] = 3
    emotions: Optional[str] = None
    lessons_learned: Optional[str] = None

class TradeBase(BaseModel):
    instrument: str = "XAUUSD"
    entry_price: float
    position_size: float
    direction: TradeDirection
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    pre_analysis: Optional[PreAnalysisBase] = None

class TradeCreate(TradeBase):
    pass

class TradeUpdate(BaseModel):
    exit_price: Optional[float] = None
    exit_date: Optional[datetime] = None
    post_analysis: Optional[PostAnalysisBase] = None
    result: Optional[float] = None
    status: Optional[TradeStatus] = None

class TradeResponse(TradeBase):
    id: int
    account_id: int
    exit_price: Optional[float] = None
    entry_date: datetime
    exit_date: Optional[datetime] = None
    pre_analysis: Optional[str] = None
    post_analysis: Optional[str] = None
    result: Optional[float] = None
    status: TradeStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True