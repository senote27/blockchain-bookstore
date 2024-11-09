import React, { useState } from 'react';
import { useAuth } from '../Auth/AuthContext';
import RoyaltiesView from './RoyaltiesView';
import BookList from '../Book/BookList';
import './AuthorDashboard.css';

const AuthorDashboard = () => {
  const [activeTab, setActiveTab] = useState('books');
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Author Dashboard</h1>
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            My Books
          </button>
          <button
            className={`tab-button ${activeTab === 'royalties' ? 'active' : ''}`}
            onClick={() => setActiveTab('royalties')}
          >
            Royalties
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'books' ? (
          <BookList authorId={user.id} />
        ) : (
          <RoyaltiesView />
        )}
      </div>
    </div>
  );
};

export default AuthorDashboard;