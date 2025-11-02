// App Configuration
// Loads configuration from .env file
import { GOOGLE_WEB_CLIENT_ID, BACKEND_API_URL } from '@env';

export const config = {
  // Backend API URL from .env (fallback for when .env isn't loaded in EAS builds)
  // Change this fallback based on your network:
  // - Physical device on same WiFi: 'http://192.168.100.2:8000'
  // - Android emulator: 'http://10.0.2.2:8000'
  BACKEND_URL: BACKEND_API_URL || 'http://192.168.100.2:8000',
  
  // Google OAuth Web Client ID from .env (fallback from EAS Secrets)
  GOOGLE_WEB_CLIENT_ID: GOOGLE_WEB_CLIENT_ID || '333706226225-hlecdsce1c6j1kuo3us1qf31kg8j0v5v.apps.googleusercontent.com',
  
  // App settings
  JWT_TOKEN_KEY: 'jwt_token',
  USER_DATA_KEY: 'user_data',
};

export default config;
