/**
 * Utility functions for handling authentication errors
 */

/**
 * Safely format any error value into a displayable string
 * Prevents rendering objects in JSX which causes "Minified React error #31"
 * @param {any} err - Any error value (Error, object, string, etc.)
 * @returns {string} Safe string representation
 */
export const formatError = (err) => {
  if (!err) return 'Unknown error occurred';
  
  // Handle Error instances
  if (err instanceof Error) {
    return err.message || 'An error occurred';
  }
  
  // Handle strings
  if (typeof err === 'string') return err;
  
  // Handle objects (API errors, Axios errors, etc.)
  if (typeof err === 'object') {
    try {
      // Extract common error message patterns
      if (err.message) return String(err.message);
      if (err.error) return String(err.error);
      if (err.error_description) return String(err.error_description);
      if (err.statusText) return String(err.statusText);
      
      // Try to stringify for debugging
      const stringified = JSON.stringify(err);
      if (stringified && stringified !== '{}') {
        return stringified;
      }
    } catch (e) {
      // JSON.stringify can fail on circular references
      console.error('Error stringifying error object:', e);
    }
    
    // Last resort for objects
    return String(err);
  }
  
  // For any other type
  return String(err);
};

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
    const formatted = formatError(err);
    if (formatted && formatted !== 'Unknown error occurred') {
      return formatted;
    }
  } catch (e) {
    console.error('Error in getAuthErrorMessage:', e);
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
