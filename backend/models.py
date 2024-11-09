from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class UserRole(str, Enum):
    USER = "user"
    AUTHOR = "author"
    SELLER = "seller"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    eth_address = Column(String, unique=True, index=True)
    role = Column(SQLEnum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    books_authored = relationship("Book", back_populates="author", foreign_keys="Book.author_id")
    books_sold = relationship("Book", back_populates="seller", foreign_keys="Book.seller_id")
    purchases = relationship("Purchase", back_populates="user")
    royalties_received = relationship("Royalty", back_populates="author")

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    pdf_hash = Column(String)  # IPFS hash of the PDF file
    cover_hash = Column(String)  # IPFS hash of the cover image
    royalty_percentage = Column(Float)
    is_active = Column(Boolean, default=True)
    total_sales = Column(Integer, default=0)
    
    # Blockchain related fields
    contract_id = Column(Integer, index=True)  # ID in the smart contract
    transaction_hash = Column(String)  # Transaction hash when book was added
    
    # Foreign keys
    author_id = Column(Integer, ForeignKey("users.id"))
    seller_id = Column(Integer, ForeignKey("users.id"))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("User", back_populates="books_authored", foreign_keys=[author_id])
    seller = relationship("User", back_populates="books_sold", foreign_keys=[seller_id])
    purchases = relationship("Purchase", back_populates="book")
    royalties = relationship("Royalty", back_populates="book")

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(Integer, ForeignKey("books.id"))
    price_paid = Column(Float)
    transaction_hash = Column(String, unique=True, index=True)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    
    # Blockchain verification
    is_verified = Column(Boolean, default=False)
    block_number = Column(Integer)
    
    # Relationships
    user = relationship("User", back_populates="purchases")
    book = relationship("Book", back_populates="purchases")

class Royalty(Base):
    __tablename__ = "royalties"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(Integer, ForeignKey("books.id"))
    purchase_id = Column(Integer, ForeignKey("purchases.id"))
    amount = Column(Float)
    transaction_hash = Column(String, unique=True, index=True)
    payment_date = Column(DateTime, default=datetime.utcnow)
    
    # Blockchain verification
    is_paid = Column(Boolean, default=False)
    block_number = Column(Integer)
    
    # Relationships
    author = relationship("User", back_populates="royalties_received")
    book = relationship("Book", back_populates="royalties")
    purchase = relationship("Purchase")

class IPFSCache(Base):
    __tablename__ = "ipfs_cache"

    id = Column(Integer, primary_key=True, index=True)
    file_hash = Column(String, unique=True, index=True)
    file_type = Column(String)  # 'pdf' or 'cover'
    original_filename = Column(String)
    file_size = Column(Integer)
    mime_type = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    access_count = Column(Integer, default=0)

class BlockchainSync(Base):
    __tablename__ = "blockchain_sync"

    id = Column(Integer, primary_key=True, index=True)
    last_synced_block = Column(Integer)
    sync_type = Column(String)  # 'books', 'purchases', 'royalties'
    status = Column(String)  # 'success', 'failed', 'in_progress'
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

def init_db(engine):
    """Initialize the database by creating all tables"""
    Base.metadata.create_all(bind=engine)