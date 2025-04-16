// src/services/apiService.js
import axios from 'axios';

// Define the API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL
});

export default api;