import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import BookCard from './BookCard';
import BookModal from './BookModal';
import AddBook from './AddBook';
import './BookList.css';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, web3, account } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBook(null);
  };

  const handlePurchase = async (book) => {
    try {
      const priceInWei = web3.utils.toWei(book.price.toString(), 'ether');
      
      // Call smart contract purchase function
      const contract = new web3.eth.Contract(BookStoreABI, CONTRACT_ADDRESS);
      await contract.methods.buyBook(book.id).send({
        from: account,
        value: priceInWei
      });

      // Update backend
      await fetch(`/api/books/${book.id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      alert('Book purchased successfully!');
      fetchBooks();
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to purchase book');
    }
  };

  return (
    <div className="book-list-container">
      {user && (user.role === 'seller' || user.role === 'author') && (
        <button 
          className="add-book-button"
          onClick={() => setShowAddBook(true)}
        >
          Add New Book
        </button>
      )}

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => handleBookClick(book)}
            />
          ))}
        </div>
      )}

      {showModal && selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={handleCloseModal}
          onPurchase={handlePurchase}
        />
      )}

      {showAddBook && (
        <AddBook
          onClose={() => setShowAddBook(false)}
          onBookAdded={fetchBooks}
        />
      )}
    </div>
  );
};

export default BookList;