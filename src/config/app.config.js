// App Configuration
// Loads configuration from .env file
import { GOOGLE_WEB_CLIENT_ID, BACKEND_API_URL } from '@env';

export const config = {
  // Backend API URL from .env
  BACKEND_URL: BACKEND_API_URL || 'http://10.0.2.2:3000/api',
  
  // Google OAuth Web Client ID from .env
  GOOGLE_WEB_CLIENT_ID: GOOGLE_WEB_CLIENT_ID,
  
  // App settings
  JWT_TOKEN_KEY: 'jwt_token',
  USER_DATA_KEY: 'user_data',
};

export default config;
