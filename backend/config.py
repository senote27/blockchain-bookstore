import os
from dotenv import load_load_dotenv

load_dotenv()

class Config:
    # Basic configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Database configuration
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///bookstore.db')
    
    # JWT configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))  # 1 hour
    
    # Web3 configuration
    WEB3_PROVIDER_URI = os.getenv('WEB3_PROVIDER_URI', 'http://localhost:8545')
    CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
    
    # IPFS configuration
    IPFS_HOST = os.getenv('IPFS_HOST', 'localhost')
    IPFS_PORT = int(os.getenv('IPFS_PORT', 5001))
    
    # CORS configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')