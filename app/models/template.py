# app/models/template.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    template_name = Column(String, index=True)
    market = Column(String, default="Gold")
    setup_type = Column(String, nullable=True)
    entry_criteria = Column(Text, nullable=True)
    exit_criteria = Column(Text, nullable=True)
    risk_reward_ratio = Column(Float, nullable=True)
    position_size_rule = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    tags = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="templates")