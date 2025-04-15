// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Check if user is logged in (has valid token)
        const user = await authService.getCurrentUser();
        
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          console.log('User authenticated:', user);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
          console.log('No authenticated user found');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const user = await authService.login(credentials);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const user = await authService.register(userData);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};