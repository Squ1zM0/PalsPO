/**
 * Shared error formatting utilities
 * Prevents "Minified React error #31" by ensuring errors are always converted to strings
 */

// Constants for error formatting
const DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again.';
const MAX_ERROR_STRING_LENGTH = 200;

/**
 * Safely format any error value into a displayable string
 * This is the single source of truth for error formatting across the app
 * 
 * @param {any} err - Any error value (Error, object, string, null, etc.)
 * @returns {string} Safe string representation that can be rendered in JSX
 */
export function formatErrorForDisplay(err) {
  if (!err) return 'Unknown error occurred';
  
  // Handle Error instances
  if (err instanceof Error) {
    return err.message || err.toString();
  }
  
  // Handle strings
  if (typeof err === 'string') return err;
  
  // Handle objects (API errors, Axios errors, etc.)
  if (typeof err === 'object') {
    try {
      // Try to extract common error properties
      if (err.message) return String(err.message);
      if (err.error) return String(err.error);
      if (err.error_description) return String(err.error_description);
      if (err.statusText) return String(err.statusText);
      
      // For development/debugging: try to show meaningful object representation
      // But avoid returning "[object Object]" which React can't render well
      try {
        const stringified = JSON.stringify(err, null, 2);
        if (stringified && stringified !== '{}' && stringified !== 'null') {
          // Only return stringified version if it's short enough to be readable
          if (stringified.length < MAX_ERROR_STRING_LENGTH) {
            return stringified;
          } else {
            // For large objects, just show that an error occurred
            return DEFAULT_ERROR_MESSAGE;
          }
        }
      } catch (stringifyError) {
        // If JSON.stringify fails (e.g., circular references), continue to fallback
        console.error('Error stringifying error object:', stringifyError);
      }
      
      // Last resort: return a generic message instead of "[object Object]"
      return DEFAULT_ERROR_MESSAGE;
    } catch (handlingError) {
      console.error('Error in formatErrorForDisplay:', handlingError);
      return DEFAULT_ERROR_MESSAGE;
    }
  }
  
  // Fallback for any other type - avoid returning "[object Object]"
  const converted = String(err);
  if (converted === '[object Object]') {
    return DEFAULT_ERROR_MESSAGE;
  }
  return converted;
}

/**
 * Normalize any error value to an Error instance
 * Ensures consistent error handling across authentication methods
 * 
 * @param {any} error - Any error value
 * @param {string} defaultMessage - Default message if error can't be normalized
 * @returns {Error} A proper Error instance
 */
export function normalizeError(error, defaultMessage = 'An error occurred') {
  // Already an Error instance
  if (error instanceof Error) {
    return error;
  }
  
  // String error
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  // Object with message property
  if (error?.message) {
    return new Error(String(error.message));
  }
  
  // Fallback
  return new Error(defaultMessage);
}
