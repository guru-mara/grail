// src/services/analyticsService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/analytics';

// Helper to get auth token and create auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Get trade analytics data
const getTradeAnalytics = async (filters = {}) => {
  try {
    // Convert filters to query params if needed
    const params = new URLSearchParams();
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.accountId) params.append('account_id', filters.accountId);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await axios.get(`${API_URL}/trades${queryString}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching trade analytics:', error);
    // Return empty data instead of throwing error so UI can still render
    return {
      profitLoss: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      totalTrades: 0,
      trades: []
    };
  }
};

// Get performance statistics
const getPerformanceStats = async (timeframe = 'all') => {
  try {
    const response = await axios.get(`${API_URL}/performance?timeframe=${timeframe}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    return {
      dailyProfitLoss: [],
      monthlyProfitLoss: [],
      instruments: [],
      directions: { long: 0, short: 0 }
    };
  }
};

// Get trading journal insights
const getJournalInsights = async () => {
  try {
    const response = await axios.get(`${API_URL}/insights`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching journal insights:', error);
    return {
      emotionImpact: [],
      setupEffectiveness: [],
      timeOfDayPerformance: [],
      lessonsTags: []
    };
  }
};

const analyticsService = {
  getTradeAnalytics,
  getPerformanceStats,
  getJournalInsights
};

export default analyticsService;