import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');

    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
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

      // Handle 401 Unauthorized errors - user session expired or invalid token
      if (error.response.status === 401) {
        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');

        // Only redirect if not already on login/signup page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
          window.location.href = '/login';
        }
      }
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

// ============ UPCOMING TRANSACTION OPERATIONS ============

/**
 * Fetch all upcoming transactions
 * @returns {Promise<Array>} Array of upcoming transaction objects
 */
export const getUpcomingTransactions = async () => {
  try {
    const response = await api.get('/upcoming-transactions/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch upcoming transactions');
  }
};

/**
 * Post an upcoming transaction immediately
 * @param {number} id - Upcoming transaction ID
 * @returns {Promise<Object>} Created transaction object
 */
export const postUpcomingTransaction = async (id) => {
  try {
    const response = await api.post(`/upcoming-transactions/${id}/post_now/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to post upcoming transaction');
  }
};

/**
 * Skip an upcoming transaction occurrence
 * @param {number} id - Upcoming transaction ID
 * @returns {Promise<Object>} Response message
 */
export const skipUpcomingTransaction = async (id) => {
  try {
    const response = await api.post(`/upcoming-transactions/${id}/skip/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to skip upcoming transaction');
  }
};

/**
 * Skip all future occurrences of an upcoming transaction
 * @param {number} id - Upcoming transaction ID
 * @returns {Promise<Object>} Response message
 */
export const skipAllUpcomingTransactions = async (id) => {
  try {
    const response = await api.post(`/upcoming-transactions/${id}/skip_all/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to skip all upcoming transactions');
  }
};

/**
 * Update an upcoming transaction
 * @param {number} id - Upcoming transaction ID
 * @param {Object} transactionData - Updated transaction data
 * @returns {Promise<Object>} Updated upcoming transaction object
 */
export const updateUpcomingTransaction = async (id, transactionData) => {
  try {
    const response = await api.patch(`/upcoming-transactions/${id}/`, transactionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update upcoming transaction');
  }
};

/**
 * Delete an upcoming transaction
 * @param {number} id - Upcoming transaction ID
 * @returns {Promise<void>}
 */
export const deleteUpcomingTransaction = async (id) => {
  try {
    await api.delete(`/upcoming-transactions/${id}/`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete upcoming transaction');
  }
};

// ============ TRANSFER CRUD OPERATIONS ============

/**
 * Fetch all transfers
 * @returns {Promise<Array>} Array of transfer objects
 */
export const getTransfers = async () => {
  try {
    const response = await api.get('/transfers/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch transfers');
  }
};

/**
 * Create a new transfer
 * @param {Object} transferData - Transfer data to create
 * @returns {Promise<Object>} Created transfer object
 */
export const createTransfer = async (transferData) => {
  try {
    const response = await api.post('/transfers/', transferData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create transfer');
  }
};

/**
 * Update an existing transfer
 * @param {number} id - Transfer ID
 * @param {Object} transferData - Transfer data to update
 * @returns {Promise<Object>} Updated transfer object
 */
export const updateTransfer = async (id, transferData) => {
  try {
    const response = await api.patch(`/transfers/${id}/`, transferData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update transfer');
  }
};

/**
 * Delete a transfer
 * @param {number} id - Transfer ID
 * @returns {Promise<void>}
 */
export const deleteTransfer = async (id) => {
  try {
    await api.delete(`/transfers/${id}/`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete transfer');
  }
};

// ============ TEMPLATE OPERATIONS ============

/**
 * Fetch all templates
 * @returns {Promise<Array>} Array of template objects
 */
export const getTemplates = async () => {
  try {
    const response = await api.get('/templates/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch templates');
  }
};

/**
 * Create a new template
 * @param {Object} templateData - Template data
 * @returns {Promise<Object>} Created template object
 */
export const createTemplate = async (templateData) => {
  try {
    const response = await api.post('/templates/', templateData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create template');
  }
};

/**
 * Update an existing template
 * @param {number} id - Template ID
 * @param {Object} templateData - Updated template data
 * @returns {Promise<Object>} Updated template object
 */
export const updateTemplate = async (id, templateData) => {
  try {
    const response = await api.patch(`/templates/${id}/`, templateData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update template');
  }
};

/**
 * Delete a template
 * @param {number} id - Template ID
 * @returns {Promise<void>}
 */
export const deleteTemplate = async (id) => {
  try {
    await api.delete(`/templates/${id}/`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete template');
  }
};

// ============ INSIGHTS OPERATIONS ============

/**
 * Fetch monthly summary data for insights
 * @param {number} year - Year to fetch data for (optional, defaults to current year)
 * @returns {Promise<Array>} Array of monthly summary objects
 */
export const getMonthlySummary = async (year = null) => {
  try {
    const params = year ? { year } : {};
    const response = await api.get('/analytics/monthly-summaries/insights/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch monthly summary');
  }
};

/**
 * Fetch current month summary from analytics
 * @returns {Promise<Object>} Current month summary object
 */
export const getCurrentMonthSummary = async () => {
  try {
    const response = await api.get('/analytics/current-month/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch current month summary');
  }
};

export default api;
