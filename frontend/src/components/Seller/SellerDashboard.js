import React, { useState } from 'react';
import { useAuth } from '../Auth/AuthContext';
import BookManagement from './BookManagement';
import AddBook from '../Book/AddBook';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [showAddBook, setShowAddBook] = useState(false);
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <button
          className="add-book-button"
          onClick={() => setShowAddBook(true)}
        >
          Add New Book
        </button>
      </div>

      <BookManagement />

      {showAddBook && (
        <AddBook
          onClose={() => setShowAddBook(false)}
          onBookAdded={() => {
            setShowAddBook(false);
            // Refresh book list
          }}
        />
      )}
    </div>
  );
};

export default SellerDashboard;