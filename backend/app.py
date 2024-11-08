from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from web3 import Web3
import json

app = Flask(__name__)
CORS(app)

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bookstore.db'
db = SQLAlchemy(app)

# Ethereum connection (e.g., using Ganache)
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))  # Update with your provider

# Load contract ABI
with open('BookStoreABI.json', 'r') as abi_file:
    contract_abi = json.load(abi_file)

contract_address = 'YOUR_CONTRACT_ADDRESS'  # Replace with your contract address
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(120))
    eth_address = db.Column(db.String(42))
    role = db.Column(db.String(10))  # 'user', 'author', 'seller'

db.create_all()

# Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    new_user = User(
        username=data['username'],
        password=data['password'],
        eth_address=data['eth_address'],
        role=data['role']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully.'}), 201

@app.route('/login', methods=['POST'])
def login():
    # Implement user authentication here
    pass

@app.route('/addBook', methods=['POST'])
def add_book():
    data = request.json
    tx_hash = contract.functions.addBook(
        data['title'],
        data['pdfHash'],
        data['imageHash'],
        int(data['price']),
        data['authorAddress']
    ).transact({'from': data['sellerAddress']})
    w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'message': 'Book added successfully.'}), 201

@app.route('/getBooks', methods=['GET'])
def get_books():
    books = contract.functions.getBooks().call()
    book_list = []
    for book in books:
        book_list.append({
            'id': book[0],
            'title': book[1],
            'pdfHash': book[2],
            'imageHash': book[3],
            'price': book[4],
            'author': book[5]
        })
    return jsonify(book_list), 200

@app.route('/buyBook', methods=['POST'])
def buy_book():
    data = request.json
    book = contract.functions.books(data['bookId']).call()
    tx_hash = contract.functions.buyBook(data['bookId']).transact({
        'from': data['buyerAddress'],
        'value': book[4]
    })
    w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'message': 'Book purchased successfully.'}), 200

@app.route('/getPurchases/<user_address>', methods=['GET'])
def get_purchases(user_address):
    purchases = contract.functions.getPurchases(user_address).call()
    return jsonify(purchases), 200

@app.route('/getRoyalties/<author_address>', methods=['GET'])
def get_royalties(author_address):
    royalties = contract.functions.getRoyalties(author_address).call()
    return jsonify({'royalties': royalties}), 200

if __name__ == '__main__':
    app.run(debug=True)