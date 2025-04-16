# app/routes/accounts.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import Account
from app.schemas.account import AccountCreate, AccountResponse

router = APIRouter()

@router.post("/", response_model=AccountResponse)
def create_account(
    account: AccountCreate, 
    db: Session = Depends(get_db)
):
    db_account = Account(
        **account.dict(),
        current_balance=account.initial_balance,
        user_id=1  # Set a default user_id or remove if not needed
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.get("/", response_model=List[AccountResponse])
def read_accounts(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    accounts = db.query(Account).offset(skip).limit(limit).all()
    return accounts

@router.get("/{account_id}", response_model=AccountResponse)
def read_account(
    account_id: int, 
    db: Session = Depends(get_db)
):
    account = db.query(Account).filter(Account.id == account_id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.delete("/{account_id}")
def delete_account(
    account_id: int, 
    db: Session = Depends(get_db)
):
    account = db.query(Account).filter(Account.id == account_id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db.delete(account)
    db.commit()
    return {"message": "Account deleted successfully"}