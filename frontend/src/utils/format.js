/**
 * Get currency symbol for a given currency code
 * @param {string} currency - Currency code (USD, EUR, GBP, etc.)
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CHF: 'Fr',
    CAD: 'C$',
    AUD: 'A$',
    CNY: '¥',
    INR: '₹',
    RUB: '₽',
    BRL: 'R$',
    ZAR: 'R',
    MXN: '$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    TRY: '₺',
    KRW: '₩',
    THB: '฿',
  };

  return symbols[currency] || currency;
};

/**
 * Format a number as currency
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'EUR') => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return `${getCurrencySymbol(currency)}0.00`;
  }

  const symbol = getCurrencySymbol(currency);
  const formattedAmount = Math.abs(numAmount).toFixed(2);
  const parts = formattedAmount.split('.');

  // Add thousands separators
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const sign = numAmount < 0 ? '-' : '';

  return `${sign}${symbol}${parts.join('.')}`;
};

/**
 * Format a date string or Date object
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const options = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' },
  };

  return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
};

/**
 * Format a date in relative terms (e.g., "2 days ago", "in 3 days")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative date string
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = dateObj - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

/**
 * Get color class for transaction type
 * @param {string} type - Transaction type ('income' or 'expense')
 * @returns {string} CSS class name
 */
export const getTransactionColor = (type) => {
  return type === 'income' ? 'text-green-600' : 'text-red-600';
};

/**
 * Get color class for budget percentage
 * @param {number} percentage - Budget usage percentage
 * @returns {string} CSS class name
 */
export const getBudgetColor = (percentage) => {
  if (percentage >= 100) return 'text-red-600';
  if (percentage >= 75) return 'text-orange-500';
  if (percentage >= 50) return 'text-yellow-500';
  return 'text-green-600';
};

/**
 * Format Date object to YYYY-MM-DD string in local timezone
 * Avoids timezone conversion issues with toISOString()
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDateToLocal = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
