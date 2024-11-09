import React from 'react';

const BookModal = ({ book, onClose, onPurchase, web3 }) => {
    const priceInEth = web3.utils.fromWei(book.price.toString(), 'ether');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <div className="modal-body">
                    <img 
                        src={`https://ipfs.io/ipfs/${book.imageHash}`}
                        alt={book.title}
                        className="modal-image"
                    />
                    <div className="book-details">
                        <h2>{book.title}</h2>
                        <p>Price: {priceInEth} ETH</p>
                        <p>Author: {book.author}</p>
                        <p>Royalty: {book.royaltyPercentage}%</p>
                        <button 
                            className="purchase-button-large"
                            onClick={() => onPurchase(book)}
                        >
                            Purchase Book
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookModal;