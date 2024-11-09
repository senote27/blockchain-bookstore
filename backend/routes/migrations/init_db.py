from sqlalchemy import create_engine, MetaData
from sqlalchemy.schema import CreateTable
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql import ClauseElement

import sys
import os

# Add parent directory to path to import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import Base, User, Book, Purchase, Royalty, UserRole
from config import Config
from database import engine

def create_tables():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Successfully created all database tables")
    except Exception as e:
        print(f"❌ Error creating database tables: {str(e)}")
        sys.exit(1)

def drop_tables():
    """Drop all database tables"""
    try:
        Base.metadata.drop_all(bind=engine)
        print("✅ Successfully dropped all database tables")
    except Exception as e:
        print(f"❌ Error dropping database tables: {str(e)}")
        sys.exit(1)

def create_indexes():
    """Create database indexes"""
    try:
        # Create indexes for User table
        engine.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_eth_address ON users(eth_address);
        """)

        # Create indexes for Book table
        engine.execute("""
            CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
            CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
            CREATE INDEX IF NOT EXISTS idx_books_seller_id ON books(seller_id);
        """)

        # Create indexes for Purchase table
        engine.execute("""
            CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
            CREATE INDEX IF NOT EXISTS idx_purchases_book_id ON purchases(book_id);
            CREATE INDEX IF NOT EXISTS idx_purchases_transaction_hash ON purchases(transaction_hash);
        """)

        # Create indexes for Royalty table
        engine.execute("""
            CREATE INDEX IF NOT EXISTS idx_royalties_author_id ON royalties(author_id);
            CREATE INDEX IF NOT EXISTS idx_royalties_book_id ON royalties(book_id);
            CREATE INDEX IF NOT EXISTS idx_royalties_transaction_hash ON royalties(transaction_hash);
        """)

        print("✅ Successfully created all database indexes")
    except Exception as e:
        print(f"❌ Error creating database indexes: {str(e)}")
        sys.exit(1)

def create_triggers():
    """Create database triggers"""
    try:
        # Trigger to automatically create royalty records after purchase
        engine.execute("""
            CREATE TRIGGER IF NOT EXISTS trg_create_royalty_after_purchase
            AFTER INSERT ON purchases
            BEGIN
                INSERT INTO royalties (
                    author_id,
                    book_id,
                    purchase_id,
                    amount,
                    transaction_hash
                )
                SELECT 
                    b.author_id,
                    NEW.book_id,
                    NEW.id,
                    (NEW.price_paid * b.royalty_percentage / 100.0),
                    NEW.transaction_hash
                FROM books b
                WHERE b.id = NEW.book_id
                AND b.author_id IS NOT NULL;
            END;
        """)

        print("✅ Successfully created all database triggers")
    except Exception as e:
        print(f"❌ Error creating database triggers: {str(e)}")
        sys.exit(1)

def create_views():
    """Create database views"""
    try:
        # View for book sales statistics
        engine.execute("""
            CREATE VIEW IF NOT EXISTS vw_book_sales AS
            SELECT 
                b.id as book_id,
                b.title,
                b.author_id,
                b.seller_id,
                COUNT(p.id) as total_sales,
                SUM(p.price_paid) as total_revenue,
                AVG(p.price_paid) as avg_price
            FROM books b
            LEFT JOIN purchases p ON b.id = p.book_id
            GROUP BY b.id, b.title, b.author_id, b.seller_id;
        """)

        # View for author royalties summary
        engine.execute("""
            CREATE VIEW IF NOT EXISTS vw_author_royalties AS
            SELECT 
                u.id as author_id,
                u.username as author_name,
                COUNT(DISTINCT r.book_id) as books_with_royalties,
                SUM(r.amount) as total_royalties,
                COUNT(r.id) as total_royalty_payments
            FROM users u
            LEFT JOIN royalties r ON u.id = r.author_id
            WHERE u.role = 'author'
            GROUP BY u.id, u.username;
        """)

        print("✅ Successfully created all database views")
    except Exception as e:
        print(f"❌ Error creating database views: {str(e)}")
        sys.exit(1)

def seed_initial_data():
    """Seed initial data for testing"""
    try:
        # Create test users with different roles
        engine.execute("""
            INSERT INTO users (username, email, hashed_password, role, eth_address)
            VALUES 
                ('test_user', 'user@test.com', 'hashed_password', 'user', '0x1234...'),
                ('test_author', 'author@test.com', 'hashed_password', 'author', '0x5678...'),
                ('test_seller', 'seller@test.com', 'hashed_password', 'seller', '0x9abc...')
            ON CONFLICT DO NOTHING;
        """)

        print("✅ Successfully seeded initial data")
    except Exception as e:
        print(f"❌ Error seeding initial data: {str(e)}")
        sys.exit(1)

def init_database():
    """Initialize the complete database schema"""
    print("🚀 Initializing database...")
    
    # Drop existing tables if they exist
    print("\n📦 Dropping existing tables...")
    drop_tables()
    
    # Create new tables
    print("\n📦 Creating tables...")
    create_tables()
    
    # Create indexes
    print("\n📇 Creating indexes...")
    create_indexes()
    
    # Create triggers
    print("\n⚡ Creating triggers...")
    create_triggers()
    
    # Create views
    print("\n👁️ Creating views...")
    create_views()
    
    # Seed initial data
    print("\n🌱 Seeding initial data...")
    seed_initial_data()
    
    print("\n✨ Database initialization completed successfully!")

if __name__ == "__main__":
    init_database()