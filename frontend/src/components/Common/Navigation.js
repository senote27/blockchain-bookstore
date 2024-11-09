import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, logout, account } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/" className="nav-logo">
          BlockchainBookstore
        </Link>
      </div>

      <div className="nav-links">
        {user ? (
          <>
            {/* Role-specific links */}
            {user.role === 'user' && (
              <Link to="/user-dashboard" className="nav-link">My Books</Link>
            )}
            {user.role === 'author' && (
              <>
                <Link to="/author-dashboard" className="nav-link">Dashboard</Link>
                <Link to="/royalties" className="nav-link">Royalties</Link>
              </>
            )}
            {user.role === 'seller' && (
              <>
                <Link to="/seller-dashboard" className="nav-link">Dashboard</Link>
                <Link to="/book-management" className="nav-link">Manage Books</Link>
              </>
            )}
            
            {/* Common authenticated links */}
            <Link to="/books" className="nav-link">Browse Books</Link>
            
            <div className="nav-user-info">
              <span className="eth-address">{truncateAddress(account)}</span>
              <span className="username">{user.username}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;