import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import Loading from '../Common/Loading';
import Error from '../Common/Error';
import './RoyaltiesView.css';

const RoyaltiesView = () => {
  const [royalties, setRoyalties] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, web3, account } = useAuth();

  useEffect(() => {
    fetchRoyalties();
  }, []);

  const fetchRoyalties = async () => {
    try {
      const response = await fetch('/api/author/royalties', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch royalties');
      const data = await response.json();
      setRoyalties(data.transactions);
      setTotalEarnings(data.totalEarnings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="royalties-container">
      <div className="royalties-summary">
        <h2>Total Earnings</h2>
        <p className="total-earnings">
          {web3.utils.fromWei(totalEarnings, 'ether')} ETH
        </p>
      </div>

      <div className="royalties-list">
        <h3>Transaction History</h3>
        {royalties.length === 0 ? (
          <p className="no-royalties">No royalties earned yet.</p>
        ) : (
          <table className="royalties-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Date</th>
                <th>Amount (ETH)</th>
                <th>Transaction</th>
              </tr>
            </thead>
            <tbody>
              {royalties.map(royalty => (
                <tr key={royalty.id}>
                  <td>{royalty.bookTitle}</td>
                  <td>{new Date(royalty.date).toLocaleDateString()}</td>
                  <td>{web3.utils.fromWei(royalty.amount, 'ether')}</td>
                  <td>
                    <a
                      href={`https://etherscan.io/tx/${royalty.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RoyaltiesView;