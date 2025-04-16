// src/services/calculatorService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/calculator';

// Helper to get auth token and create auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Calculate position size
const calculatePositionSize = async (calculationData) => {
  try {
    const response = await axios.post(`${API_URL}/position-size`, calculationData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error calculating position size:', error);
    throw error.response?.data || { message: 'Failed to calculate position size' };
  }
};

// Calculate risk/reward ratio
const calculateRiskReward = async (calculationData) => {
  try {
    const response = await axios.post(`${API_URL}/risk-reward`, calculationData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error calculating risk/reward:', error);
    throw error.response?.data || { message: 'Failed to calculate risk/reward ratio' };
  }
};

// Calculate profit/loss
const calculateProfitLoss = async (calculationData) => {
  try {
    const response = await axios.post(`${API_URL}/profit-loss`, calculationData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error calculating profit/loss:', error);
    throw error.response?.data || { message: 'Failed to calculate profit/loss' };
  }
};

const calculatorService = {
  calculatePositionSize,
  calculateRiskReward,
  calculateProfitLoss
};

export default calculatorService;