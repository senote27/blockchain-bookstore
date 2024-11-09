import React from 'react';
import './Loading.css';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export const LoadingOverlay = ({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <Loading />
      </div>
      <div className="loading-overlay-background">
        {children}
      </div>
    </div>
  );
};

export default Loading;