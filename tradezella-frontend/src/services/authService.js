import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

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
    if (response.data && response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login a user
const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    console.log('Login response:', response.data);
    
    if (response.data && response.data.token) {
      setToken(response.data.token);
      console.log('Token stored:', localStorage.getItem('token'));
      const { token, ...user } = response.data;
      return user;
    } else {
      console.error('No token in response:', response.data);
      throw { message: 'Login successful but no token received' };
    }
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
    setToken(null);
    return null;
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getToken();
};

// Create named object for export
const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  initAuth,
  isAuthenticated
};

export default authService;