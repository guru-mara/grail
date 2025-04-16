// authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token to localStorage
const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Initialize authentication state
const initAuth = () => {
  // Set up axios to include the token in all requests
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  return getCurrentUser();
};

// Register a new user
const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    // Check if token is in response and store it
    if (response.data && response.data.access_token) {
      setToken(response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login a user
const login = async (credentials) => {
  try {
    // Convert to form data format which FastAPI OAuth2PasswordRequestForm expects
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await axios.post(`${API_URL}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Store the token
    if (response.data && response.data.access_token) {
      setToken(response.data.access_token);
      
      // Try to get user details
      const userResponse = await getCurrentUser();
      return userResponse || { username: credentials.username };
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Logout a user
const logout = () => {
  setToken(null);
  return Promise.resolve();
};

// Get current user from token
const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const response = await axios.get(`${API_URL}/me`);
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    if (error.response?.status === 401) {
      setToken(null); // Clear invalid token
    }
    return null;
  }
};

// Create named object for export
const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  initAuth,
  getToken
};

export default authService;