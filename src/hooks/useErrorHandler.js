import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { handleHttpError, getErrorMessage } from '../utils/errorHandler';

/**
 * Custom hook for handling errors in React components
 * @returns {Object} - Error handling utilities
 */
export const useErrorHandler = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handle errors and optionally redirect to error pages
   * @param {Error} error - The error to handle
   * @param {Object} options - Options for error handling
   * @param {boolean} options.redirect - Whether to redirect to error pages
   * @param {Function} options.onError - Custom error handler
   */
  const handleError = useCallback((error, options = {}) => {
    const { redirect = false, onError } = options;
    
    console.error('Error handled:', error);
    
    // Set local error state
    setError(getErrorMessage(error));
    
    // Call custom error handler if provided
    if (onError) {
      onError(error);
    }
    
    // Redirect to error pages if requested
    if (redirect) {
      handleHttpError(error, navigate);
    }
  }, [navigate]);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Execute an async function with error handling
   * @param {Function} asyncFn - The async function to execute
   * @param {Object} options - Options for error handling
   * @returns {Promise} - The result of the async function
   */
  const executeWithErrorHandling = useCallback(async (asyncFn, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      return result;
    } catch (error) {
      handleError(error, options);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  /**
   * Handle API errors specifically
   * @param {Error} error - The API error
   * @param {Object} options - Options for error handling
   */
  const handleApiError = useCallback((error, options = {}) => {
    const { showToast = true, redirect = false } = options;
    
    const errorMessage = getErrorMessage(error);
    setError(errorMessage);
    
    if (redirect) {
      handleHttpError(error, navigate);
    }
    
    // You could integrate with a toast notification system here
    if (showToast) {
      console.warn('Error message for toast:', errorMessage);
    }
  }, [navigate]);

  return {
    error,
    loading,
    handleError,
    clearError,
    executeWithErrorHandling,
    handleApiError,
    setError,
    setLoading
  };
};


