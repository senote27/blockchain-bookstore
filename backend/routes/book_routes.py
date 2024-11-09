from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from web3 import Web3

from ..database import get_db
from ..models import Book, Purchase, User, UserRole
from ..schemas import BookCreate, BookResponse, PurchaseCreate, PurchaseResponse
from ..auth import get_current_user
from ..config import Config
from ..utils.ipfs import upload_to_ipfs
from ..utils.web3_utils import get_contract

router = APIRouter(prefix="/books", tags=["books"])

@router.get("/", response_model=List[BookResponse])
async def get_books(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all books with pagination"""
    books = db.query(Book).offset(skip).limit(limit).all()
    return books

@router.get("/{book_id}", response_model=BookResponse)
async def get_book(book_id: int, db: Session = Depends(get_db)):
    """Get a specific book by ID"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    return book

@router.post("/", response_model=BookResponse)
async def create_book(
    book_data: BookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new book (only authors and sellers)"""
    if current_user.role not in [UserRole.AUTHOR, UserRole.SELLER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only authors and sellers can create books"
        )

    try:
        # Upload files to IPFS
        pdf_hash = await upload_to_ipfs(book_data.pdf_file)
        cover_hash = await upload_to_ipfs(book_data.cover_image)

        # Create book in smart contract
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
            author_id=current_user.id if current_user.role == UserRole.AUTHOR else None,
            seller_id=current_user.id if current_user.role == UserRole.SELLER else None
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

@router.post("/{book_id}/purchase", response_model=PurchaseResponse)
async def purchase_book(
    book_id: int,
    purchase_data: PurchaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase a book"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )

    # Check if user already purchased the book
    existing_purchase = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.book_id == book_id
    ).first()
    
    if existing_purchase:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already purchased this book"
        )

    try:
        # Process purchase through smart contract
        contract = get_contract()
        tx_hash = await contract.functions.purchaseBook(book_id).transact({
            'from': current_user.eth_address,
            'value': Web3.toWei(book.price, 'ether')
        })

        # Create purchase record
        purchase = Purchase(
            user_id=current_user.id,
            book_id=book_id,
            transaction_hash=tx_hash.hex(),
            price_paid=book.price
        )
        
        db.add(purchase)
        db.commit()
        db.refresh(purchase)
        return purchase

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{book_id}/download")
async def download_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download a purchased book"""
    # Verify purchase
    purchase = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.book_id == book_id
    ).first()
    
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have not purchased this book"
        )

    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )

    return {"download_url": f"https://ipfs.io/ipfs/{book.pdf_hash}"}