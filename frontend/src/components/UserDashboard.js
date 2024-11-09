import React, { useState, useEffect } from 'react';
import BookCard from './BookCard';
import BookModal from './BookModal';

const UserDashboard = ({ contract, account, web3 }) => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBooks();
    }, [contract]);

    const loadBooks = async () => {
        try {
            const allBooks = await contract.methods.getAllBooks().call();
            setBooks(allBooks);
        } catch (error) {
            console.error('Error loading books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (book) => {
        try {
            await contract.methods.buyBook(book.id).send({
                from: account,
                value: book.price
            });
            alert('Book purchased successfully!');
            loadBooks();
        } catch (error) {
            console.error('Error purchasing book:', error);
            alert('Failed to purchase book');
        }
    };

    if (loading) return <div>Loading books...</div>;

    return (
        <div className="dashboard-container">
            <h2>Available Books</h2>
            <div className="books-grid">
                {books.map(book => (
                    <BookCard
                        key={book.id}
                        book={book}
                        onImageClick={setSelectedBook}
                        onPurchase={handlePurchase}
                        web3={web3}
                    />
                ))}
            </div>

            {selectedBook && (
                <BookModal
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                    onPurchase={handlePurchase}
                    web3={web3}
                />
            )}
        </div>
    );
};

export default UserDashboard;