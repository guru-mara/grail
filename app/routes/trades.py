# app/routes/trades.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from app.database import get_db
from app.models.models import User, Account, Trade, TradeStatus
from app.schemas.trade import TradeCreate, TradeUpdate, TradeResponse
from app.utils.security import get_current_active_user

router = APIRouter()

@router.post("/", response_model=TradeResponse)
def create_trade(
    trade_data: TradeCreate,
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if account exists and belongs to user
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Process pre-analysis if provided
    pre_analysis_json = None
    if trade_data.pre_analysis:
        pre_analysis_json = json.dumps(trade_data.pre_analysis.dict())
    
    # Create trade
    trade_dict = trade_data.dict(exclude={"pre_analysis"})
    db_trade = Trade(
        **trade_dict,
        account_id=account_id,
        pre_analysis=pre_analysis_json
    )
    
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)
    return db_trade

@router.get("/", response_model=List[TradeResponse])
def read_user_trades(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    trades = db.query(Trade).join(Account).filter(
        Account.user_id == current_user.id
    ).order_by(Trade.entry_date.desc()).offset(skip).limit(limit).all()
    
    return trades

@router.get("/account/{account_id}", response_model=List[TradeResponse])
def read_account_trades(
    account_id: int,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if account exists and belongs to user
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    trades = db.query(Trade).filter(
        Trade.account_id == account_id
    ).order_by(Trade.entry_date.desc()).offset(skip).limit(limit).all()
    
    return trades

@router.get("/{trade_id}", response_model=TradeResponse)
def read_trade(
    trade_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    trade = db.query(Trade).join(Account).filter(
        Trade.id == trade_id,
        Account.user_id == current_user.id
    ).first()
    
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    return trade

@router.patch("/{trade_id}/close", response_model=TradeResponse)
def close_trade(
    trade_id: int,
    trade_update: TradeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get trade and verify ownership
    trade = db.query(Trade).join(Account).filter(
        Trade.id == trade_id,
        Account.user_id == current_user.id
    ).first()
    
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    # Process post-analysis if provided
    if trade_update.post_analysis:
        trade.post_analysis = json.dumps(trade_update.post_analysis.dict())
    
    # Update trade fields
    if trade_update.exit_price is not None:
        trade.exit_price = trade_update.exit_price
    
    if trade_update.exit_date is not None:
        trade.exit_date = trade_update.exit_date
    else:
        trade.exit_date = datetime.utcnow()
    
    # Calculate result if not provided
    if trade_update.result is not None:
        trade.result = trade_update.result
    elif trade.exit_price and trade.entry_price:
        # Calculate profit/loss
        if trade.direction == TradeDirection.LONG:
            trade.result = (trade.exit_price - trade.entry_price) * trade.position_size
        else:
            trade.result = (trade.entry_price - trade.exit_price) * trade.position_size
    
    # Update status
    trade.status = TradeStatus.CLOSED
    
    # Update account balance
    if trade.result:
        account = db.query(Account).filter(Account.id == trade.account_id).first()
        account.current_balance += trade.result
    
    db.commit()
    db.refresh(trade)
    return trade

@router.patch("/{trade_id}/analysis", response_model=TradeResponse)
def update_trade_analysis(
    trade_id: int,
    pre_analysis: Optional[dict] = None,
    post_analysis: Optional[dict] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get trade and verify ownership
    trade = db.query(Trade).join(Account).filter(
        Trade.id == trade_id,
        Account.user_id == current_user.id
    ).first()
    
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    # Update pre-analysis if provided
    if pre_analysis:
        trade.pre_analysis = json.dumps(pre_analysis)
    
    # Update post-analysis if provided
    if post_analysis:
        trade.post_analysis = json.dumps(post_analysis)
    
    db.commit()
    db.refresh(trade)
    return trade

@router.delete("/{trade_id}")
def delete_trade(
    trade_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get trade and verify ownership
    trade = db.query(Trade).join(Account).filter(
        Trade.id == trade_id,
        Account.user_id == current_user.id
    ).first()
    
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    # If trade is closed and has affected account balance, revert it
    if trade.status == TradeStatus.CLOSED and trade.result:
        account = db.query(Account).filter(Account.id == trade.account_id).first()
        account.current_balance -= trade.result
    
    db.delete(trade)
    db.commit()
    return {"message": "Trade deleted successfully"}