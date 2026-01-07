/**
 * Utility functions for handling authentication errors
 */

import { formatErrorForDisplay } from './errorFormatter';

// Re-export for convenience
export const formatError = formatErrorForDisplay;

/**
 * Extract a user-friendly error message from an API error
 * @param {Error} err - The error object from the API call
 * @param {string} defaultMessage - Default message if no specific error is found
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (err, defaultMessage = 'An error occurred. Please try again.') => {
  // Ensure we always return a string
  try {
    // Check for response error from API (Axios style)
    if (err?.response?.data?.error) {
      return String(err.response.data.error);
    }
    
    // Check for error message from exception
    if (err?.message) {
      return String(err.message);
    }
    
    // Use formatError as fallback
    return formatErrorForDisplay(err) || defaultMessage;
  } catch (e) {
    console.error('Error in getAuthErrorMessage:', e);
    return defaultMessage;
  }
};

/**
 * Handle an authentication error with proper logging
 * @param {Error} err - The error object
 * @param {string} context - Context of the error (e.g., 'Login', 'Registration')
 * @param {Function} setError - State setter function for error message
 * @returns {string} The error message that was set
 */
export const handleAuthError = (err, context, setError) => {
  // Enhanced logging for production debugging
  console.error(`${context} failed:`, err);
  console.error(`${context} error type:`, typeof err);
  console.error(`${context} error constructor:`, err?.constructor?.name);
  
  let errorMessage;
  
  try {
    // Check for response error (Axios)
    if (err?.response) {
      console.error(`${context} response status:`, err.response.status);
      console.error(`${context} response data:`, err.response.data);
      errorMessage = getAuthErrorMessage(err, `${context} failed. Please try again.`);
    } else if (err?.request) {
      // No response received
      console.error(`${context} no response. Request:`, err.request);
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else {
      // Other error
      console.error(`${context} other error:`, err);
      errorMessage = getAuthErrorMessage(err, `${context} failed. Please try again.`);
    }
  } catch (handlingError) {
    console.error('Error while handling auth error:', handlingError);
    errorMessage = `${context} failed. Please try again.`;
  }
  
  // Ensure errorMessage is always a string
  const safeErrorMessage = String(errorMessage || `${context} failed. Please try again.`);
  
  // Set the error state with a guaranteed string
  setError(safeErrorMessage);
  
  return safeErrorMessage;
};
