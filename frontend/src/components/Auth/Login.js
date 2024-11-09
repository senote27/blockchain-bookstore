import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userData = await login(username, password);
      // Redirect based on user role
      switch(userData.role) {
        case 'user':
          history.push('/user-dashboard');
          break;
        case 'author':
          history.push('/author-dashboard');
          break;
        case 'seller':
          history.push('/seller-dashboard');
          break;
        default:
          history.push('/user-dashboard');
      }
    } catch (error) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login to BookStore</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Login</button>
      </form>
      <p className="auth-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;