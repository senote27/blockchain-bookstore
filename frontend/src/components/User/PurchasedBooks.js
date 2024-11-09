import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import Loading from '../Common/Loading';
import Error from '../Common/Error';
import './PurchasedBooks.css';

const PurchasedBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPurchasedBooks();
  }, []);

  const fetchPurchasedBooks = async () => {
    try {
      const response = await fetch('/api/user/books', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadBook = async (bookId, pdfHash) => {
    try {
      const response = await fetch(`https://ipfs.io/ipfs/${pdfHash}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `book-${bookId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download book');
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="purchased-books">
      <h2>My Library</h2>
      {books.length === 0 ? (
        <p className="no-books">You haven't purchased any books yet.</p>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <div key={book.id} className="purchased-book-card">
              <img
                src={`https://ipfs.io/ipfs/${book.coverHash}`}
                alt={book.title}
                className="book-cover"
              />
              <div className="book-info">
                <h3>{book.title}</h3>
                <p>By: {book.authorName}</p>
                <button
                  onClick={() => downloadBook(book.id, book.pdfHash)}
                  className="download-button"
                >
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchasedBooks;