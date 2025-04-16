// src/services/accountService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/accounts';

// Helper to get auth token and create auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Get all accounts for a user
const getAccounts = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error.response?.data || { message: 'Failed to fetch accounts' };
  }
};

// Create a new account
const createAccount = async (accountData) => {
  try {
    const response = await axios.post(API_URL, accountData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error.response?.data || { message: 'Failed to create account' };
  }
};

// Get account by ID
const getAccountById = async (accountId) => {
  try {
    const response = await axios.get(`${API_URL}/${accountId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error.response?.data || { message: 'Failed to fetch account details' };
  }
};

// Delete an account
const deleteAccount = async (accountId) => {
  try {
    const response = await axios.delete(`${API_URL}/${accountId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error.response?.data || { message: 'Failed to delete account' };
  }
};

const accountService = {
  getAccounts,
  createAccount,
  getAccountById,
  deleteAccount
};

export default accountService;