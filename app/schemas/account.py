# app/schemas/account.py - FIXED VERSION
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AccountBase(BaseModel):
    account_name: str
    broker_name: Optional[str] = None
    initial_balance: float
    account_type: Optional[str] = "Personal"

class AccountCreate(AccountBase):
    pass

class AccountResponse(AccountBase):
    id: int
    user_id: int
    current_balance: float
    created_at: datetime

    class Config:
        orm_mode = True