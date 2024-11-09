from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database import get_db
from models import User, Book, Purchase, Royalty, UserRole
from auth import get_current_user
from schemas import (
    BookResponse,
    RoyaltyResponse,
    AuthorStats,
    BookSalesReport
)

router = APIRouter()

@router.get("/books", response_model=List[BookResponse])
async def get_author_books(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.AUTHOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not an author"
        )
    return db.query(Book).filter(Book.author_id == current_user.id).all()

@router.get("/royalties", response_model=List[RoyaltyResponse])
async def get_royalties(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.AUTHOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not an author"
        )
    return db.query(Royalty).filter(Royalty.author_id == current_user.id).all()

@router.get("/stats", response_model=AuthorStats)
async def get_author_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.AUTHOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not an author"
        )

    total_books = db.query(Book).filter(Book.author_id == current_user.id).count()
    total_sales = db.query(Purchase).join(Book).filter(Book.author_id == current_user.id).count()
    total_revenue = db.query(func.sum(Royalty.amount)).filter(
        Royalty.author_id == current_user.id
    ).scalar() or 0

    return {
        "total_books": total_books,
        "total_sales": total_sales,
        "total_revenue": total_revenue
    }

@router.get("/sales-report", response_model=List[BookSalesReport])
async def get_sales_report(
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.AUTHOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not an author"
        )

    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()

    sales = db.query(
        Book.id,
        Book.title,
        func.count(Purchase.id).label('total_sales'),
        func.sum(Purchase.price_paid).label('total_revenue')
    ).join(Purchase).filter(
        Book.author_id == current_user.id,
        Purchase.purchase_date.between(start_date, end_date)
    ).group_by(Book.id).all()

    return sales