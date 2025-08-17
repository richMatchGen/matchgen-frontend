// API Configuration
export const API_BASE_URL = "https://matchgen-backend-production.up.railway.app/api";

// Common headers for authenticated requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Axios instance with default configuration
import axios from "axios";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Common error handler
export const handleApiError = (error, customMessage = "An error occurred") => {
  console.error("API Error:", error);
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 401) {
    return "Authentication failed. Please log in again.";
  }
  
  if (error.response?.status === 403) {
    return "You don't have permission to perform this action.";
  }
  
  if (error.response?.status >= 500) {
    return "Server error. Please try again later.";
  }
  
  return customMessage;
};
