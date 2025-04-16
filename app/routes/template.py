# app/routes/templates.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import User
from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateResponse
from app.utils.security import get_current_active_user

router = APIRouter()

@router.post("/", response_model=TemplateResponse)
def create_template(
    template_data: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_template = Template(
        **template_data.dict(),
        user_id=current_user.id
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.get("/", response_model=List[TemplateResponse])
def read_templates(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    templates = db.query(Template).filter(
        Template.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return templates

@router.get("/{template_id}", response_model=TemplateResponse)
def read_template(
    template_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    template = db.query(Template).filter(
        Template.id == template_id,
        Template.user_id == current_user.id
    ).first()
    
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return template

@router.put("/{template_id}", response_model=TemplateResponse)
def update_template(
    template_id: int,
    template_data: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    template = db.query(Template).filter(
        Template.id == template_id,
        Template.user_id == current_user.id
    ).first()
    
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Update template fields
    for field, value in template_data.dict(exclude_unset=True).items():
        setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    return template

@router.delete("/{template_id}")
def delete_template(
    template_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    template = db.query(Template).filter(
        Template.id == template_id,
        Template.user_id == current_user.id
    ).first()
    
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(template)
    db.commit()
    return {"message": "Template deleted successfully"}