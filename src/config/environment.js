// Environment configuration
const config = {
  development: {
    API_BASE_URL: "http://localhost:8000/api",
    APP_NAME: "MatchGen Dev",
    DEBUG: true,
  },
  production: {
    API_BASE_URL: "https://matchgen-backend-production.up.railway.app/api",
    APP_NAME: "MatchGen",
    DEBUG: false,
  },
};

const environment = import.meta.env.MODE || "development";
export const env = config[environment];

// Common configuration
export const APP_CONFIG = {
  ...env,
  VERSION: "1.0.0",
  TOKEN_REFRESH_INTERVAL: 4 * 60 * 1000, // 4 minutes
  REQUEST_TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
};

export default APP_CONFIG;
