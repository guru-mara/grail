// src/services/tradeService.js
import api from './apiService';

// Get all trades
const getTrades = async () => {
  try {
    const response = await api.get('/api/trades');
    return response.data;
  } catch (error) {
    console.error('Error fetching trades:', error);
    throw error.response?.data || { message: 'Failed to fetch trades' };
  }
};

// Get trades for a specific account
const getAccountTrades = async (accountId) => {
  try {
    const response = await api.get(`/api/trades/account/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching account trades:', error);
    throw error.response?.data || { message: 'Failed to fetch account trades' };
  }
};

// Get a specific trade
const getTradeById = async (tradeId) => {
  try {
    const response = await api.get(`/api/trades/${tradeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trade:', error);
    throw error.response?.data || { message: 'Failed to fetch trade details' };
  }
};

// Create a new trade
const createTrade = async (accountId, tradeData) => {
  try {
    const response = await api.post(`/api/trades?account_id=${accountId}`, tradeData);
    return response.data;
  } catch (error) {
    console.error('Error creating trade:', error);
    throw error.response?.data || { message: 'Failed to create trade' };
  }
};

// Update trade analysis (pre or post)
const updateTradeAnalysis = async (tradeId, analysisData) => {
  try {
    const response = await api.patch(`/api/trades/${tradeId}/analysis`, analysisData);
    return response.data;
  } catch (error) {
    console.error('Error updating trade analysis:', error);
    throw error.response?.data || { message: 'Failed to update trade analysis' };
  }
};

// Close a trade
const closeTrade = async (tradeId, closeData) => {
  try {
    const response = await api.patch(`/api/trades/${tradeId}/close`, closeData);
    return response.data;
  } catch (error) {
    console.error('Error closing trade:', error);
    throw error.response?.data || { message: 'Failed to close trade' };
  }
};

// Delete a trade
const deleteTrade = async (tradeId) => {
  try {
    const response = await api.delete(`/api/trades/${tradeId}`);
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