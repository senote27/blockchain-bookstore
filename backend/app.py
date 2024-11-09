from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from web3 import Web3
import ipfsapi

from config import Config
from database import get_db, init_db
from models import User, Book, Purchase, Royalty, UserRole
from auth import get_current_user, authenticate_user, create_access_token
from schemas import (
    UserCreate, UserLogin, UserResponse,
    BookCreate, BookResponse,
    PurchaseCreate, PurchaseResponse,
    RoyaltyResponse
)

app = FastAPI(title="Blockchain Bookstore API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Web3 and IPFS
web3 = Web3(Web3.HTTPProvider(Config.WEB3_PROVIDER_URI))
ipfs = ipfsapi.Client(Config.IPFS_HOST, Config.IPFS_PORT)

# Authentication endpoints
@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Implementation for user registration

@app.post("/auth/login")
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Implementation for user login

# Book endpoints
@app.get("/books", response_model=List[BookResponse])
async def get_books(db: Session = Depends(get_db)):
    # Implementation for getting all books

@app.post("/books", response_model=BookResponse)
async def create_book(
    book_data: BookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Implementation for creating a new book

@app.get("/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: int, db: Session = Depends(get_db)):
    # Implementation for getting a specific book

# Purchase endpoints
@app.post("/books/{book_id}/purchase", response_model=PurchaseResponse)
async def purchase_book(
    book_id: int,
    purchase_data: PurchaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Implementation for purchasing a book

# User-specific endpoints
@app.get("/user/books", response_model=List[BookResponse])
async def get_user_books(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Implementation for getting user's purchased books

# Author-specific endpoints
@app.get("/author/books", response_model=List[BookResponse])
async def get_author_books(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Implementation for getting author's books

@app.get("/author/royalties", response_model=List[RoyaltyResponse])
async def get_author_royalties(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Implementation for getting author's royalties

# Seller-specific endpoints
@app.get("/seller/books", response_model=List[BookResponse])
async def get_seller_books(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Implementation for getting seller's books

@app.put("/seller/books/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: int,
    book_data: BookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Implementation for updating a book

# Initialize database
@app.on_event("startup")
async def startup_event():
    init_db()