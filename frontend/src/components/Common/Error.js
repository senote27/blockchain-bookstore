import React from 'react';
import './Error.css';

const Error = ({ 
  message = 'An error occurred', 
  retry = null, 
  goBack = null 
}) => {
  return (
    <div className="error-container">
      <div className="error-icon">❌</div>
      <h2 className="error-title">Oops!</h2>
      <p className="error-message">{message}</p>
      <div className="error-actions">
        {retry && (
          <button 
            onClick={retry} 
            className="error-button retry-button"
          >
            Try Again
          </button>
        )}
        {goBack && (
          <button 
            onClick={goBack} 
            className="error-button back-button"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default Error;