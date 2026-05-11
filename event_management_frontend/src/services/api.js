/**
 * API Service Layer
 * Centralized Axios instance with interceptors
 * Handles authentication, error handling, and API requests
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = process.env.REACT_APP_API_TIMEOUT || 10000;

/**
 * Create Axios instance with configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(API_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add token to headers
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Return error for handling in components
    return Promise.reject(error);
  }
);

export default apiClient;
