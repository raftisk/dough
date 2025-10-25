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
      console.error('=== API ERROR DETAILS ===');
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('Request Data:', error.config?.data);
      console.error('========================');
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

// ============ TRANSACTION CRUD OPERATIONS ============

/**
 * Create a new transaction
 * @param {Object} transactionData - Transaction data to create
 * @returns {Promise<Object>} Created transaction object
 */
export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions/', transactionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create transaction');
  }
};

/**
 * Update an existing transaction
 * @param {number} id - Transaction ID
 * @param {Object} transactionData - Transaction data to update
 * @returns {Promise<Object>} Updated transaction object
 */
export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.patch(`/transactions/${id}/`, transactionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update transaction');
  }
};

/**
 * Delete a transaction
 * @param {number} id - Transaction ID
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (id) => {
  try {
    await api.delete(`/transactions/${id}/`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete transaction');
  }
};

// ============ CATEGORY CRUD OPERATIONS ============

/**
 * Create a new category
 * @param {Object} categoryData - Category data to create
 * @returns {Promise<Object>} Created category object
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories/', categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create category');
  }
};

/**
 * Update an existing category
 * @param {number} id - Category ID
 * @param {Object} categoryData - Category data to update
 * @returns {Promise<Object>} Updated category object
 */
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.patch(`/categories/${id}/`, categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update category');
  }
};

/**
 * Delete a category
 * @param {number} id - Category ID
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id) => {
  try {
    await api.delete(`/categories/${id}/`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
};

// ============ WALLET CRUD OPERATIONS ============

/**
 * Create a new wallet
 * @param {Object} walletData - Wallet data to create
 * @returns {Promise<Object>} Created wallet object
 */
export const createWallet = async (walletData) => {
  try {
    const response = await api.post('/wallets/', walletData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create wallet');
  }
};

/**
 * Update an existing wallet
 * @param {number} id - Wallet ID
 * @param {Object} walletData - Wallet data to update
 * @returns {Promise<Object>} Updated wallet object
 */
export const updateWallet = async (id, walletData) => {
  try {
    const response = await api.patch(`/wallets/${id}/`, walletData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update wallet');
  }
};

/**
 * Delete a wallet
 * @param {number} id - Wallet ID
 * @returns {Promise<void>}
 */
export const deleteWallet = async (id) => {
  try {
    await api.delete(`/wallets/${id}/`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete wallet');
  }
};

// ============ BUDGET CRUD OPERATIONS ============

/**
 * Create a new budget
 * @param {Object} budgetData - Budget data to create
 * @returns {Promise<Object>} Created budget object
 */
export const createBudget = async (budgetData) => {
  try {
    const response = await api.post('/budgets/', budgetData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create budget');
  }
};

/**
 * Update an existing budget
 * @param {number} id - Budget ID
 * @param {Object} budgetData - Budget data to update
 * @returns {Promise<Object>} Updated budget object
 */
export const updateBudget = async (id, budgetData) => {
  try {
    const response = await api.patch(`/budgets/${id}/`, budgetData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update budget');
  }
};

/**
 * Delete a budget
 * @param {number} id - Budget ID
 * @returns {Promise<void>}
 */
export const deleteBudget = async (id) => {
  try {
    await api.delete(`/budgets/${id}/`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete budget');
  }
};

export default api;
