from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import User, Book, Purchase, UserRole
from auth import get_current_user
from schemas import (
    UserProfile,
    UserProfileUpdate,
    BookResponse,
    PurchaseResponse
)

router = APIRouter()

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/books", response_model=List[BookResponse])
async def get_purchased_books(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    purchases = db.query(Purchase).filter(Purchase.user_id == current_user.id).all()
    return [purchase.book for purchase in purchases]

@router.get("/purchases", response_model=List[PurchaseResponse])
async def get_purchase_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Purchase).filter(Purchase.user_id == current_user.id).all()

@router.post("/books/{book_id}/purchase", response_model=PurchaseResponse)
async def purchase_book(
    book_id: int,
    transaction_hash: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if book exists
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )

    # Check if already purchased
    existing_purchase = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.book_id == book_id
    ).first()
    if existing_purchase:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book already purchased"
        )

    # Create purchase record
    purchase = Purchase(
        user_id=current_user.id,
        book_id=book_id,
        transaction_hash=transaction_hash,
        price_paid=book.price,
        purchase_date=datetime.utcnow()
    )
    
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return purchase