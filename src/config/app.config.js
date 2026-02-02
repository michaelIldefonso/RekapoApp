// App Configuration
// Loads configuration from .env file and Firebase Remote Config
import { GOOGLE_WEB_CLIENT_ID, BACKEND_API_URL, FIREBASE_CONFIG_URL } from '@env';

// Debug logging to verify .env values are loaded
console.log('🔧 Config Debug:');
console.log('  BACKEND_API_URL from .env:', BACKEND_API_URL || 'NOT SET');
console.log('  GOOGLE_WEB_CLIENT_ID from .env:', GOOGLE_WEB_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('  FIREBASE_CONFIG_URL from .env:', FIREBASE_CONFIG_URL || 'NOT SET');

// Remove trailing slash from BACKEND_API_URL if present
const sanitizedBackendUrl = (BACKEND_API_URL || 'http://192.168.100.2:8000').replace(/\/$/, '');

// In-memory config that can be updated dynamically
let dynamicBackendUrl = sanitizedBackendUrl;

export const config = {
  // Backend API URL - starts with .env value, can be updated dynamically
  get BACKEND_URL() {
    return dynamicBackendUrl;
  },
  // Google OAuth Web Client ID from .env (fallback from EAS Secrets)
  GOOGLE_WEB_CLIENT_ID: GOOGLE_WEB_CLIENT_ID || '33370626225-hlecdsce1c6j1kuo3us1qf31kg8j0v5v.apps.googleusercontent.com',
  // App settings
  JWT_TOKEN_KEY: 'jwt_token',
  USER_DATA_KEY: 'user_data',
};

/**
 * Fetch dynamic config from Firebase
 * Call this on app startup to get the latest backend URL
 */
export const fetchDynamicConfig = async () => {
  // Skip Firebase fetch if URL is not set
  if (!FIREBASE_CONFIG_URL) {
    console.log('ℹ️ FIREBASE_CONFIG_URL not set, using .env BACKEND_API_URL');
    return { success: false, error: 'Firebase URL not configured' };
  }
  
  try {
    console.log('🌐 Fetching dynamic config from Firebase...');
    const response = await fetch(FIREBASE_CONFIG_URL, {
      cache: 'no-cache', // Always get fresh config
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const remoteConfig = await response.json();
    
    if (remoteConfig.backendUrl) {
      dynamicBackendUrl = remoteConfig.backendUrl.replace(/\/$/, '');
      console.log('✅ Updated BACKEND_URL from Firebase:', dynamicBackendUrl);
      return { success: true, url: dynamicBackendUrl };
    } else {
      console.warn('⚠️ No backendUrl in remote config');
      return { success: false, error: 'No backendUrl in config' };
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch Firebase config, using fallback:', error.message);
    return { success: false, error: error.message };
  }
};

console.log('✅ Initial BACKEND_URL:', config.BACKEND_URL);
console.log('✅ Final GOOGLE_WEB_CLIENT_ID:', config.GOOGLE_WEB_CLIENT_ID ? 'Present' : 'MISSING');

export default config;
