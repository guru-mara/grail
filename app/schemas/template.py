# app/schemas/template.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TemplateBase(BaseModel):
    template_name: str
    market: Optional[str] = "Gold"
    setup_type: Optional[str] = None
    entry_criteria: Optional[str] = None
    exit_criteria: Optional[str] = None
    risk_reward_ratio: Optional[float] = None
    position_size_rule: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = None

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(TemplateBase):
    template_name: Optional[str] = None

class TemplateResponse(TemplateBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True