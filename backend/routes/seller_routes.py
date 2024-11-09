from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Book, User, UserRole
from ..schemas import BookCreate, BookResponse, BookUpdate
from ..auth import get_current_user
from ..utils.ipfs import upload_to_ipfs
from ..utils.web3_utils import get_contract

router = APIRouter(prefix="/seller", tags=["seller"])

def verify_seller(user: User):
    """Verify that the user is a seller"""
    if user.role != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to sellers only"
        )

@router.get("/books", response_model=List[BookResponse])
async def get_seller_books(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all books listed by the seller"""
    verify_seller(current_user)
    
    books = db.query(Book).filter(Book.seller_id == current_user.id).all()
    return books

@router.post("/books", response_model=BookResponse)
async def create_seller_book(
    book_data: BookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new book listing"""
    verify_seller(current_user)

    try:
        # Upload files to IPFS
        pdf_hash = await upload_to_ipfs(book_data.pdf_file)
        cover_hash = await upload_to_ipfs(book_data.cover_image)

        # Add book to smart contract
        contract = get_contract()
        tx_hash = await contract.functions.addBook(
            book_data.title,
            Web3.toWei(book_data.price, 'ether'),
            pdf_hash,
            book_data.royalty_percentage
        ).transact({'from': current_user.eth_address})

        # Create book in database
        db_book = Book(
            title=book_data.title,
            description=book_data.description,
            price=book_data.price,
            pdf_hash=pdf_hash,
            cover_hash=cover_hash,
            royalty_percentage=book_data.royalty_percentage,
            seller_id=current_user.id
        )
        
        db.add(db_book)
        db.commit()
        db.refresh(db_book)
        return db_book

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/books/{book_id}", response_model=BookResponse)
async def update_seller_book(
    book_id: int,
    book_update: BookUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a book listing"""
    verify_seller(current_user)

    book = db.query(Book).filter(
        Book.id == book_id,
        Book.seller_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found or you don't have permission to update it"
        )

    try:
        # Handle file updates if provided
        if book_update.pdf_file:
            book.pdf_hash = await upload_to_ipfs(book_update.pdf_file)
        if book_update.cover_image:
            book.cover_hash = await upload_to_ipfs(book_update.cover_image)

        # Update smart contract if price changed
        if book_update.price and book_update.price != book.price:
            contract = get_contract()
            await contract.functions.updateBookPrice(
                book_id,
                Web3.toWei(book_update.price, 'ether')
            ).transact({'from': current_user.eth_address})

        # Update database fields
        for key, value in book_update.dict(exclude_unset=True).items():
            if hasattr(book, key):
                setattr(book, key, value)

        db.commit()
        db.refresh(book)
        return book

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/books/{book_id}")
async def delete_seller_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a book listing"""
    verify_seller(current_user)

    book = db.query(Book).filter(
        Book.id == book_id,
        Book.seller_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found or you don't have permission to delete it"
        )

    try:
        # Remove from smart contract
        contract = get_contract()
        await contract.functions.removeBook(book_id).transact({
            'from': current_user.eth_address
        })

        # Remove from database
        db.delete(book)
        db.commit()
        return {"message": "Book successfully deleted"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/sales")
async def get_seller_sales(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sales statistics for seller's books"""
    verify_seller(current_user)

    # Query all sales for seller's books
    sales = db.query(Purchase).join(Book).filter(
        Book.seller_id == current_user.id
    ).all()

    total_sales = len(sales)
    total_revenue = sum(sale.price_paid for sale in sales)

    return {
        "total_sales": total_sales,
        "total_revenue": total_revenue,
        "sales_by_book": [
            {
                "book_id": book.id,
                "title": book.title,
                "sales_count": len(book.purchases),
                "revenue": sum(p.price_paid for p in book.purchases)
            }
            for book in current_user.books
        ]
    }