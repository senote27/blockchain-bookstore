from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from web3 import Web3
import json
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bookstore.db'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max-limit
db = SQLAlchemy(app)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Ethereum setup
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))

# Load contract ABI
with open('BookStoreABI.json', 'r') as abi_file:
    contract_abi = json.load(abi_file)

contract_address = '0xa5614113F16a32A1d7d2699c01108feBcf9642A6'  # Update after deployment
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    eth_address = db.Column(db.String(42), unique=True, nullable=False)
    role = db.Column(db.String(10), nullable=False)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, nullable=False)
    buyer_address = db.Column(db.String(42), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    tx_hash = db.Column(db.String(66), nullable=False)

db.create_all()

# Routes
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        user = User(
            username=data['username'],
            eth_address=data['eth_address'],
            role=data['role']
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return jsonify({
            'message': 'File uploaded successfully',
            'filepath': filepath
        }), 200

@app.route('/books', methods=['GET'])
def get_books():
    try:
        books = contract.functions.getAllBooks().call()
        return jsonify(books), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    try:
        book = contract.functions.getBook(book_id).call()
        return jsonify(book), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/books/add', methods=['POST'])
def add_book():
    try:
        data = request.json
        tx_hash = contract.functions.addBook(
            data['title'],
            data['pdfHash'],
            data['imageHash'],
            int(data['price']),
            data['author'],
            int(data['royaltyPercentage'])
        ).transact({'from': data['author']})
        return jsonify({'tx_hash': tx_hash.hex()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/purchases/<address>', methods=['GET'])
def get_purchases(address):
    try:
        purchases = contract.functions.getPurchasedBooks(address).call()
        return jsonify(purchases), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/royalties/<address>', methods=['GET'])
def get_royalties(address):
    try:
        royalties = contract.functions.getAuthorRoyalties(address).call()
        return jsonify({'royalties': royalties}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)