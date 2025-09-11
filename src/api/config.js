import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://matchgen-backend-production.up.railway.app/api/'
  : 'http://localhost:8000/api/';

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Request tracking for rate limiting
let lastRequestTime = 0;
let requestQueue = [];

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased from 10000 to 30000 (30 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Rate limiting interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    lastRequestTime = Date.now();
    
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 429 errors and retries
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 429 (Too Many Requests) errors
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Get retry-after header or use default delay
      const retryAfter = error.response.headers['retry-after'] || RETRY_DELAY;
      
      console.warn(`Rate limited. Retrying after ${retryAfter}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      
      return apiClient(originalRequest);
    }
    
    // Handle other errors with retry logic
    if (error.response?.status >= 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.warn(`Server error ${error.response.status}. Retrying...`);
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
      return apiClient(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors gracefully
export const handleApiError = (error, context = 'API request') => {
  // Handle timeout errors specifically
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    console.error(`${context}: Request timed out.`);
    return {
      error: 'Request timed out. Please check your connection and try again.',
      timeout: true
    };
  }
  
  if (error.response?.status === 429) {
    console.warn(`${context}: Rate limited. Please wait before making more requests.`);
    return {
      error: 'Rate limited. Please wait before making more requests.',
      retryAfter: error.response.headers['retry-after'] || 60
    };
  }
  
  if (error.response?.status === 401) {
    console.warn(`${context}: Unauthorized. Please log in again.`);
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    return { error: 'Please log in again.' };
  }
  
  if (error.response?.status === 404) {
    console.warn(`${context}: Resource not found.`);
    return { error: 'Resource not found.' };
  }
  
  if (error.response?.status >= 500) {
    console.error(`${context}: Server error.`, error.response.data);
    return { error: 'Server error. Please try again later.' };
  }
  
  console.error(`${context}:`, error.message);
  return { error: error.message || 'An unexpected error occurred.' };
};

// Helper function for making API requests with better error handling
export const makeApiRequest = async (requestFn, context = 'API request') => {
  try {
    const response = await requestFn();
    return { success: true, data: response.data };
  } catch (error) {
    const errorInfo = handleApiError(error, context);
    return { success: false, ...errorInfo };
  }
};

// Common API functions
export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserProfile = async () => {
  return makeApiRequest(
    () => apiClient.get('/users/me/'),
    'Get user profile'
  );
};

export const getClubInfo = async () => {
  console.log('🏢 getClubInfo called');
  console.log('🏢 API_BASE_URL:', API_BASE_URL);
  console.log('🏢 Auth headers:', getAuthHeaders());
  
  return makeApiRequest(
    () => apiClient.get('/users/my-club/'),
    'Get club info'
  );
};

export const getMatches = async () => {
  return makeApiRequest(
    () => apiClient.get('/content/matches/'),
    'Get matches'
  );
};

// Enhanced club info function with global rate limiting
export const getClubInfoWithRateLimit = async () => {
  // Check if we're already rate limited globally
  const globalRateLimit = localStorage.getItem('globalRateLimit');
  if (globalRateLimit) {
    const rateLimitData = JSON.parse(globalRateLimit);
    const now = Date.now();
    if (now < rateLimitData.until) {
      const remainingTime = Math.ceil((rateLimitData.until - now) / 1000);
      return {
        success: false,
        error: `Rate limited. Please wait ${remainingTime} seconds before trying again.`,
        retryAfter: remainingTime
      };
    } else {
      localStorage.removeItem('globalRateLimit');
    }
  }

  const result = await getClubInfo();
  
  // If we get rate limited, store it globally
  if (!result.success && result.error.includes('Rate limited')) {
    const retryAfter = result.retryAfter || 60;
    const until = Date.now() + (retryAfter * 1000);
    localStorage.setItem('globalRateLimit', JSON.stringify({ until, retryAfter }));
  }
  
  return result;
};

// Utility function to validate and get club ID
export const getValidClubId = () => {
  const clubId = localStorage.getItem('selectedClubId');
  return clubId && clubId !== 'null' ? clubId : null;
};

// Utility function to check if user has a valid club
export const hasValidClub = () => {
  return getValidClubId() !== null;
};

export default apiClient;
