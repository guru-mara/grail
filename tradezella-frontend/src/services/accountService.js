// src/services/accountService.js
import api from './apiService';

// Get all accounts for a user
const getAccounts = async () => {
  try {
    const response = await api.get('/api/accounts');
    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error.response?.data || { message: 'Failed to fetch accounts' };
  }
};

// Create a new account
const createAccount = async (accountData) => {
  try {
    const response = await api.post('/api/accounts', accountData);
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error.response?.data || { message: 'Failed to create account' };
  }
};

// Get account by ID
const getAccountById = async (accountId) => {
  try {
    const response = await api.get(`/api/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error.response?.data || { message: 'Failed to fetch account details' };
  }
};

// Delete an account
const deleteAccount = async (accountId) => {
  try {
    const response = await api.delete(`/api/accounts/${accountId}`);
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