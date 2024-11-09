import React, { useState, useEffect } from 'react';
import ipfsService from '../../utils/ipfsService';
import './IPFSStatus.css';

const IPFSStatus = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  const checkStatus = async () => {
    try {
      setStatus('checking');
      const result = await ipfsService.getNodeStatus();
      setStatus(result.status);
      setError(result.error);
    } catch (error) {
      setStatus('error');
      setError(error.message);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`ipfs-status ${status}`}>
      <div className="status-indicator"></div>
      <div className="status-text">
        IPFS Desktop: {status}
        {error && <div className="error-message">{error}</div>}
      </div>
      {status === 'error' && (
        <button onClick={checkStatus} className="retry-button">
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default IPFSStatus;