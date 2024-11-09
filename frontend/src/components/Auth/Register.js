import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    ethAddress: ''
  });
  const [error, setError] = useState('');
  const { register, web3, account } = useAuth();
  const history = useHistory();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const connectWallet = async () => {
    try {
      if (!web3) {
        setError('Please install MetaMask');
        return;
      }
      setFormData({
        ...formData,
        ethAddress: account
      });
    } catch (error) {
      setError('Failed to connect wallet');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.ethAddress) {
      setError('Please connect your wallet');
      return;
    }

    try {
      await register(formData);
      history.push('/');
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register for BookStore</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="user">User</option>
            <option value="author">Author</option>
            <option value="seller">Seller</option>
          </select>
        </div>
        <div className="form-group">
          <label>Ethereum Address</label>
          <div className="eth-address-container">
            <input
              type="text"
              value={formData.ethAddress}
              readOnly
              placeholder="Connect wallet to get address"
            />
            <button type="button" onClick={connectWallet} className="connect-wallet-button">
              Connect Wallet
            </button>
          </div>
        </div>
        <button type="submit" className="auth-button">Register</button>
      </form>
      <p className="auth-link">
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
};

export default Register;