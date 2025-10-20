/**
 * Date utility functions for Dough expense tracker
 */

/**
 * Get current month and year as a formatted string
 * @returns {string} - e.g., "October 2025"
 */
export function getCurrentMonthYear() {
  const now = new Date();
  const options = { month: 'long', year: 'numeric' };
  return now.toLocaleDateString('en-US', options);
}

/**
 * Get current month name
 * @returns {string} - e.g., "October"
 */
export function getCurrentMonth() {
  const now = new Date();
  const options = { month: 'long' };
  return now.toLocaleDateString('en-US', options);
}

/**
 * Get current year
 * @returns {number} - e.g., 2025
 */
export function getCurrentYear() {
  return new Date().getFullYear();
}

/**
 * Format date to short format
 * @param {string|Date} date - Date to format
 * @returns {string} - e.g., "Oct 15, 2025"
 */
export function formatDateShort(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Format date to long format
 * @param {string|Date} date - Date to format
 * @returns {string} - e.g., "October 15, 2025"
 */
export function formatDateLong(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}
