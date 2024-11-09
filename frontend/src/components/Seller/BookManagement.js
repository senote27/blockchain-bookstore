import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import Loading from '../Common/Loading';
import Error from '../Common/Error';
import './BookManagement.css';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchSellerBooks();
  }, []);

  const fetchSellerBooks = async () => {
    try {
      const response = await fetch('/api/seller/books', {
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

  const toggleBookStatus = async (bookId, currentStatus) => {
    try {
      const response = await fetch(`/api/seller/books/${bookId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ active: !currentStatus })
      });
      if (!response.ok) throw new Error('Failed to update book status');
      fetchSellerBooks();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="book-management">
      <h2>My Books</h2>
      <div className="books-table-container">
        <table className="books-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Author</th>
              <th>Price (ETH)</th>
              <th>Sales</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id}>
                <td>
                  <img
                    src={`https://ipfs.io/ipfs/${book.coverHash}`}
                    alt={book.title}
                    className="book-thumbnail"
                  />
                </td>
                <td>{book.title}</td>
                <td>{book.authorName}</td>
                <td>{book.price}</td>
                <td>{book.salesCount}</td>
                <td>
                  <span className={`status ${book.active ? 'active' : 'inactive'}`}>
                    {book.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggleBookStatus(book.id, book.active)}
                    className={`status-toggle ${book.active ? 'deactivate' : 'activate'}`}
                  >
                    {book.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookManagement;