import { useNavigate } from 'react-router-dom';

/**
 * Handle HTTP errors and redirect to appropriate error pages
 * @param {Error} error - The error object
 * @param {Function} navigate - React Router navigate function
 */
export const handleHttpError = (error, navigate) => {
  console.error('HTTP Error:', error);
  
  // Check if it's an axios error with response
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        navigate('/error/400');
        break;
      case 404:
        navigate('/error/404');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        navigate('/error/500');
        break;
      default:
        // For other errors, show a generic error message
        console.error('Unhandled HTTP error:', status);
        break;
    }
  } else if (error.request) {
    // Network error
    console.error('Network error:', error.request);
    // You could redirect to a network error page or show a toast
  } else {
    // Something else happened
    console.error('Error:', error.message);
  }
};

/**
 * Handle API errors with user-friendly messages
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    // Return server error message if available
    if (data && data.error) {
      return data.error;
    }
    
    // Return generic messages based on status
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return 'Invalid data provided. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service is under maintenance. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  } else if (error.request) {
    return 'Network error. Please check your connection and try again.';
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Check if an error is a network error
 * @param {Error} error - The error object
 * @returns {boolean} - True if it's a network error
 */
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

/**
 * Check if an error is a server error (5xx)
 * @param {Error} error - The error object
 * @returns {boolean} - True if it's a server error
 */
export const isServerError = (error) => {
  return error.response && error.response.status >= 500;
};

/**
 * Check if an error is a client error (4xx)
 * @param {Error} error - The error object
 * @returns {boolean} - True if it's a client error
 */
export const isClientError = (error) => {
  return error.response && error.response.status >= 400 && error.response.status < 500;
};








