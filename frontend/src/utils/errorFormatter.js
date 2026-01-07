/**
 * Shared error formatting utilities
 * Prevents "Minified React error #31" by ensuring errors are always converted to strings
 */

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
      
      // Try to stringify for debugging (useful in development)
      const stringified = JSON.stringify(err, null, 2);
      if (stringified && stringified !== '{}') {
        return stringified;
      }
    } catch (stringifyError) {
      // If JSON.stringify fails (e.g., circular references), use String()
      console.error('Error stringifying error object:', stringifyError);
    }
    
    // Last resort for objects
    return String(err);
  }
  
  // Fallback for any other type
  return String(err);
}
