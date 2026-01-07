/**
 * Utility functions for handling authentication errors
 */

/**
 * Extract a user-friendly error message from an API error
 * @param {Error} err - The error object from the API call
 * @param {string} defaultMessage - Default message if no specific error is found
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (err, defaultMessage = 'An error occurred. Please try again.') => {
  // Check for response error from API
  if (err.response?.data?.error) {
    return err.response.data.error;
  }
  
  // Check for error message from exception
  if (err.message) {
    return err.message;
  }
  
  // Return default message
  return defaultMessage;
};

/**
 * Handle an authentication error with proper logging
 * @param {Error} err - The error object
 * @param {string} context - Context of the error (e.g., 'Login', 'Registration')
 * @param {Function} setError - State setter function for error message
 * @returns {string} The error message that was set
 */
export const handleAuthError = (err, context, setError) => {
  console.error(`${context} error:`, err);
  
  let errorMessage;
  
  // Check for response error
  if (err.response) {
    console.error('Response status:', err.response.status);
    console.error('Response data:', err.response.data);
    errorMessage = getAuthErrorMessage(err, `${context} failed. Please try again.`);
  } else if (err.request) {
    // No response received
    console.error('No response received. Request:', err.request);
    errorMessage = 'Unable to connect to server. Please check your internet connection.';
  } else {
    // Other error
    errorMessage = getAuthErrorMessage(err, `${context} failed. Please try again.`);
  }
  
  setError(errorMessage);
  return errorMessage;
};
