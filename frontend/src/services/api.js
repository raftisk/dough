import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch dashboard data including summary statistics, recent transactions, and budgets
 * @returns {Promise<Object>} Dashboard data object
 */
export const getDashboardData = async () => {
  try {
    const response = await api.get('/dashboard/');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      'Failed to fetch dashboard data. Please check if the backend server is running.'
    );
  }
};

/**
 * Fetch all wallets
 * @returns {Promise<Array>} Array of wallet objects
 */
export const getWallets = async () => {
  try {
    const response = await api.get('/wallets/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch wallets');
  }
};

/**
 * Fetch all categories
 * @returns {Promise<Array>} Array of category objects
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/categories/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

/**
 * Fetch all transactions
 * @returns {Promise<Array>} Array of transaction objects
 */
export const getTransactions = async () => {
  try {
    const response = await api.get('/transactions/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
  }
};

/**
 * Fetch all budgets
 * @returns {Promise<Array>} Array of budget objects
 */
export const getBudgets = async () => {
  try {
    const response = await api.get('/budgets/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch budgets');
  }
};

export default api;
