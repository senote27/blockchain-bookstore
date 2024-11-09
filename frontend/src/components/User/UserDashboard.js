import React, { useState } from 'react';
import { useAuth } from '../Auth/AuthContext';
import PurchasedBooks from './PurchasedBooks';
import BookList from '../Book/BookList';
import './UserDashboard.css';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user.username}!</h1>
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Books
          </button>
          <button
            className={`tab-button ${activeTab === 'purchased' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchased')}
          >
            My Library
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'browse' ? (
          <BookList />
        ) : (
          <PurchasedBooks />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;