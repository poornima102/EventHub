/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
import apiClient from './api';

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User data (full_name, email, password)
   * @returns {Promise}
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials (email, password)
   * @returns {Promise}
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login/', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get token from localStorage
   * @returns {String|null}
   */
  getToken: () => localStorage.getItem('authToken'),

  /**
   * Get user from localStorage
   * @returns {Object|null}
   */
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {Boolean}
   */
  isAuthenticated: () => !!localStorage.getItem('authToken'),

  /**
   * Store token and user in localStorage
   * @param {String} token - Authentication token
   * @param {Object} user - User data
   */
  setAuthData: (token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Clear authentication data
   */
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};

export default authService;
