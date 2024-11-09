import jwt_decode from 'jwt-decode';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = this.token ? jwt_decode(this.token) : null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
    this.user = jwt_decode(token);
  }

  removeToken() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    if (!this.token) return false;

    try {
      const decoded = jwt_decode(this.token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      this.setToken(data.token);
      return this.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      this.setToken(data.token);
      return this.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout() {
    this.removeToken();
  }

  getUser() {
    return this.user;
  }

  updateUser(userData) {
    this.user = { ...this.user, ...userData };
  }

  getToken() {
    return this.token;
  }

  getRoleBasedRedirectPath() {
    if (!this.user) return '/';
    
    switch (this.user.role) {
      case 'author':
        return '/author-dashboard';
      case 'seller':
        return '/seller-dashboard';
      case 'user':
        return '/user-dashboard';
      default:
        return '/';
    }
  }
}

export default new AuthService();