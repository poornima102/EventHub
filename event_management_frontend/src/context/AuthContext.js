/**
 * Authentication Context
 * Manages global authentication state
 * Provides user info, token, and auth methods to entire app
 */
import React, { createContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  /**
   * Handle user registration
   */
  const register = useCallback(async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token: newToken, user: newUser } = response.data;
      
      // Store auth data
      authService.setAuthData(newToken, newUser);
      
      // Update context
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  }, []);

  /**
   * Handle user login
   */
  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token: newToken, user: newUser } = response.data;
      
      // Store auth data
      authService.setAuthData(newToken, newUser);
      
      // Update context
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  }, []);

  /**
   * Handle user logout
   */
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth data regardless of API response
      authService.clearAuthData();
      
      // Update context
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
