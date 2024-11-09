const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Book endpoints
  async getBooks() {
    return this.request('/books');
  }

  async getBook(id) {
    return this.request(`/books/${id}`);
  }

  async addBook(bookData) {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
  }

  async purchaseBook(bookId) {
    return this.request(`/books/${bookId}/purchase`, {
      method: 'POST'
    });
  }

  // User endpoints
  async getUserBooks() {
    return this.request('/user/books');
  }

  async updateUserProfile(userData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Author endpoints
  async getAuthorBooks() {
    return this.request('/author/books');
  }

  async getAuthorRoyalties() {
    return this.request('/author/royalties');
  }

  // Seller endpoints
  async getSellerBooks() {
    return this.request('/seller/books');
  }

  async updateBook(bookId, bookData) {
    return this.request(`/seller/books/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify(bookData)
    });
  }
}

export default new ApiService();