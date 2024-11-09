import React from 'react';
import { useAuth } from '../Auth/AuthContext';
import './BookModal.css';

const BookModal = ({ book, onClose, onPurchase }) => {
  const { user, web3 } = useAuth();

  const handlePurchaseClick = () => {
    if (window.confirm('Are you sure you want to purchase this book?')) {
      onPurchase(book);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <div className="modal-body">
          <div className="book-cover-large">
            <img 
              src={`https://ipfs.io/ipfs/${book.coverHash}`}
              alt={book.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-book-cover.png';
              }}
            />
          </div>
          
          <div className="book-details">
            <h2>{book.title}</h2>
            <p className="author">By: {book.authorName}</p>
            <p className="price">
              Price: {web3.utils.fromWei(book.price.toString(), 'ether')} ETH
            </p>
            <p className="description">{book.description}</p>
            
            {user && user.role === 'user' && (
              <button 
                className="purchase-button"
                onClick={handlePurchaseClick}
              >
                Purchase Book
              </button>
            )}
            
            {(!user || user.role === 'user') && (
              <p className="royalty-info">
                *{book.royaltyPercentage}% of the purchase will go to the author
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookModal;