import React from 'react';

const BookCard = ({ book, onImageClick, onPurchase, web3 }) => {
    const priceInEth = web3.utils.fromWei(book.price.toString(), 'ether');

    return (
        <div className="book-card">
            <div className="book-image-container" onClick={() => onImageClick(book)}>
                <img 
                    src={`https://ipfs.io/ipfs/${book.imageHash}`}
                    alt={book.title}
                    className="book-image"
                />
            </div>
            <div className="book-info">
                <h3>{book.title}</h3>
                <p>{priceInEth} ETH</p>
                <button 
                    className="purchase-button"
                    onClick={() => onPurchase(book)}
                >
                    Purchase
                </button>
            </div>
        </div>
    );
};

export default BookCard;