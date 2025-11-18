import { FALLBACK_CURRENCY, CURRENCY_MAP, FALLBACK_LOCALE } from '../constants';

// Cache for Intl.NumberFormat instances (performance optimization)
const formatters = {};

/**
 * Get currency symbol for a given currency code
 * @param {string} currencyCode - Currency code (EUR, USD, GBP, etc.)
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
  return CURRENCY_MAP[currencyCode]?.symbol || currencyCode;
};

/**
 * Format amount as currency using Intl.NumberFormat
 * Handles all formatting automatically: decimal places, thousands separators, sign, symbol placement
 *
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: FALLBACK_CURRENCY)
 * @param {string|null} amountFormat - Optional locale override (e.g., 'de-DE', 'en-US'). If null, uses currency's default locale.
 * @returns {string} Formatted currency string (e.g., "€1,234.56", "$1,234.56", "¥1,235")
 */
export const formatAmount = (amount, currency = FALLBACK_CURRENCY, amountFormat = null) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle invalid amounts
  if (isNaN(numAmount)) {
    console.warn(`formatAmount: Invalid amount "${amount}", defaulting to 0`);
    return formatAmount(0, currency, amountFormat);
  }

  // Get currency config
  const currencyConfig = CURRENCY_MAP[currency];
  if (!currencyConfig) {
    console.warn(`formatAmount: Unsupported currency "${currency}", using FALLBACK_CURRENCY`);
    return formatAmount(numAmount, FALLBACK_CURRENCY, amountFormat);
  }

  // Determine locale: use amountFormat override, or currency's default locale
  const locale = amountFormat || currencyConfig.locale;
  const decimals = currencyConfig.decimals ?? 2;

  // Create cache key combining currency and locale
  const cacheKey = `${currency}-${locale}`;

  // Get or create cached formatter
  if (!formatters[cacheKey]) {
    try {
      formatters[cacheKey] = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    } catch (error) {
      console.error(`formatAmount: Error creating formatter for ${currency} with locale ${locale}:`, error);
      // Fallback to manual formatting
      const symbol = getCurrencySymbol(currency);
      return `${symbol}${numAmount.toFixed(decimals)}`;
    }
  }

  return formatters[cacheKey].format(numAmount);
};

/**
 * Legacy alias for backward compatibility
 * @deprecated Use formatAmount instead
 */
export const formatCurrency = formatAmount;

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
