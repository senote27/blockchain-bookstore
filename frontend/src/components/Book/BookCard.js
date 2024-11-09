import React from 'react';
import { useAuth } from '../Auth/AuthContext';
import './BookCard.css';

const BookCard = ({ book, onClick }) => {
  const { web3 } = useAuth();

  return (
    <div className="book-card" onClick={onClick}>
      <div className="book-cover">
        <img 
          src={`https://ipfs.io/ipfs/${book.coverHash}`}
          alt={book.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-book-cover.png';
          }}
        />
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">By: {book.authorName}</p>
        <p className="book-price">
          {web3.utils.fromWei(book.price.toString(), 'ether')} ETH
        </p>
      </div>
    </div>
  );
};

export default BookCard;