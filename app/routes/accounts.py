# app/routes/accounts.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import User, Account
from app.schemas.account import AccountCreate, AccountResponse
from app.utils.security import get_current_active_user

router = APIRouter()

@router.post("/", response_model=AccountResponse)
def create_account(
    account: AccountCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_account = Account(
        **account.dict(),
        current_balance=account.initial_balance,
        user_id=current_user.id
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.get("/", response_model=List[AccountResponse])
def read_accounts(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    accounts = db.query(Account).filter(Account.user_id == current_user.id).offset(skip).limit(limit).all()
    return accounts

@router.get("/{account_id}", response_model=AccountResponse)
def read_account(
    account_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.delete("/{account_id}")
def delete_account(
    account_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db.delete(account)
    db.commit()
    return {"message": "Account deleted successfully"}