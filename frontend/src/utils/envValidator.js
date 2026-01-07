/**
 * Environment variable validation for production debugging
 * Helps identify configuration issues before they cause runtime errors
 */

/**
 * Validate that required environment variables are present
 * Note: We don't validate Supabase vars as this app uses a custom backend
 */
export function validateEnvironment() {
  const warnings = [];
  const errors = [];
  
  // Log environment info (never log actual values, only presence)
  console.log('=== Environment Validation ===');
  console.log('Mode:', import.meta.env.MODE);
  console.log('Dev:', import.meta.env.DEV);
  console.log('Prod:', import.meta.env.PROD);
  
  // Check for common Vite environment variables
  const envVars = import.meta.env;
  const envKeys = Object.keys(envVars);
  
  console.log('Available VITE_ env vars:', envKeys.filter(k => k.startsWith('VITE_')));
  
  // This app doesn't require specific VITE_ env vars for the frontend
  // The backend API is proxied, so no explicit API URL is needed
  
  // Check for any obvious misconfigurations
  if (import.meta.env.PROD && !import.meta.env.BASE_URL) {
    warnings.push('BASE_URL is not set in production');
  }
  
  if (warnings.length > 0) {
    console.warn('Environment warnings:', warnings);
  }
  
  if (errors.length > 0) {
    console.error('Environment errors:', errors);
    return { valid: false, errors, warnings };
  }
  
  console.log('Environment validation passed');
  return { valid: true, errors: [], warnings };
}

/**
 * Display a friendly error if environment is invalid
 * Only returns a React element if there are critical errors
 */
export function getEnvironmentError(validationResult) {
  if (!validationResult || validationResult.valid) {
    return null;
  }
  
  // Return a string error message, never an object
  return validationResult.errors.join(', ');
}
