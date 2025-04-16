// src/services/tradeService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/trades';

// Helper to get auth token and create auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Get all trades
const getTrades = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching trades:', error);
    throw error.response?.data || { message: 'Failed to fetch trades' };
  }
};

// Get trades for a specific account
const getAccountTrades = async (accountId) => {
  try {
    const response = await axios.get(`${API_URL}/account/${accountId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching account trades:', error);
    throw error.response?.data || { message: 'Failed to fetch account trades' };
  }
};

// Get a specific trade
const getTradeById = async (tradeId) => {
  try {
    const response = await axios.get(`${API_URL}/${tradeId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching trade:', error);
    throw error.response?.data || { message: 'Failed to fetch trade details' };
  }
};

// Create a new trade
const createTrade = async (accountId, tradeData) => {
  try {
    const response = await axios.post(`${API_URL}?account_id=${accountId}`, tradeData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating trade:', error);
    throw error.response?.data || { message: 'Failed to create trade' };
  }
};

// Update trade analysis (pre or post)
const updateTradeAnalysis = async (tradeId, analysisData) => {
  try {
    const response = await axios.patch(`${API_URL}/${tradeId}/analysis`, analysisData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating trade analysis:', error);
    throw error.response?.data || { message: 'Failed to update trade analysis' };
  }
};

// Close a trade
const closeTrade = async (tradeId, closeData) => {
  try {
    const response = await axios.patch(`${API_URL}/${tradeId}/close`, closeData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error closing trade:', error);
    throw error.response?.data || { message: 'Failed to close trade' };
  }
};

// Delete a trade
const deleteTrade = async (tradeId) => {
  try {
    const response = await axios.delete(`${API_URL}/${tradeId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error deleting trade:', error);
    throw error.response?.data || { message: 'Failed to delete trade' };
  }
};

const tradeService = {
  getTrades,
  getAccountTrades,
  getTradeById,
  createTrade,
  updateTradeAnalysis,
  closeTrade,
  deleteTrade
};

export default tradeService;