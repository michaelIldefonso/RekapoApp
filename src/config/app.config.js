/**
 * app.config.js — App Configuration
 *
 * Manages all configuration values for the app:
 *   - BACKEND_URL: The API server URL (can be updated dynamically from Firebase)
 *   - BYPASS_TUNNEL_IP: Header for localtunnel bypassing (fetched from Firebase)
 *   - GOOGLE_WEB_CLIENT_ID: OAuth client ID for Google Sign-In
 *   - JWT_TOKEN_KEY / USER_DATA_KEY: Storage keys for auth data
 *
 * On startup, fetchDynamicConfig() is called to get the latest backend URL
 * from Firebase Remote Config. This allows changing the backend URL without
 * rebuilding the app (useful for switching between local and cloud servers).
 */
import { GOOGLE_WEB_CLIENT_ID, BACKEND_API_URL, FIREBASE_CONFIG_URL } from '@env';

const normalizeBackendUrl = (rawUrl, fallback = 'http://192.168.100.2:8000') => {
  const input = String(rawUrl || '').trim();
  const fallbackUrl = String(fallback || '').trim();
  let normalized = input || fallbackUrl;

  if (!/^https?:\/\//i.test(normalized)) {
    const localHostPattern = /^(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/i;
    const protocol = localHostPattern.test(normalized) ? 'http' : 'https';
    normalized = `${protocol}://${normalized}`;
  }

  normalized = normalized.replace(/\/+$/, '');
  normalized = normalized.replace(/\/api$/i, '');

  return normalized;
};

// Debug logging to verify .env values are loaded
console.log('🔧 Config Debug:');
console.log('  BACKEND_API_URL from .env:', BACKEND_API_URL || 'NOT SET');
console.log('  GOOGLE_WEB_CLIENT_ID from .env:', GOOGLE_WEB_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('  FIREBASE_CONFIG_URL from .env:', FIREBASE_CONFIG_URL || 'NOT SET');

// Remove trailing slash from BACKEND_API_URL if present
const sanitizedBackendUrl = normalizeBackendUrl(BACKEND_API_URL, 'http://192.168.100.2:8000');

// In-memory config that can be updated dynamically
let dynamicBackendUrl = sanitizedBackendUrl;
let dynamicBypassIp = null; // Bypass tunnel reminder IP for localtunnel

export const config = {
  // Backend API URL - starts with .env value, can be updated dynamically
  get BACKEND_URL() {
    return dynamicBackendUrl;
  },
  // Bypass tunnel IP - fetched from Firebase, falls back to null
  get BYPASS_TUNNEL_IP() {
    return dynamicBypassIp;
  },
  // Google OAuth Web Client ID from .env (fallback from EAS Secrets)
  GOOGLE_WEB_CLIENT_ID: GOOGLE_WEB_CLIENT_ID || '33370626225-hlecdsce1c6j1kuo3us1qf31kg8j0v5v.apps.googleusercontent.com',
  // App settings
  JWT_TOKEN_KEY: 'jwt_token',
  USER_DATA_KEY: 'user_data',
};

export const getBackendUrlCandidates = () => {
  const baseCandidates = [
    normalizeBackendUrl(dynamicBackendUrl, sanitizedBackendUrl),
    normalizeBackendUrl(sanitizedBackendUrl, sanitizedBackendUrl),
  ];

  const candidates = [];
  baseCandidates.forEach((url) => {
    if (!url) return;
    candidates.push(url);

    // Add protocol fallback for transport-layer failures.
    if (url.startsWith('https://')) {
      candidates.push(url.replace(/^https:\/\//i, 'http://'));
    } else if (url.startsWith('http://')) {
      candidates.push(url.replace(/^http:\/\//i, 'https://'));
    }
  });

  return [...new Set(candidates)];
};

/**
 * Fetch dynamic config from Firebase
 * Call this on app startup to get the latest backend URL
 */
export const fetchDynamicConfig = async () => {
  if (!FIREBASE_CONFIG_URL) {
    console.log('ℹ️ FIREBASE_CONFIG_URL not set, skipping remote config fetch.');
    return { success: false, error: 'FIREBASE_CONFIG_URL not configured' };
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
      dynamicBackendUrl = normalizeBackendUrl(remoteConfig.backendUrl, sanitizedBackendUrl);
      console.log('✅ Updated BACKEND_URL from Firebase:', dynamicBackendUrl);
    }
    
    if (remoteConfig.bypassTunnelIp) {
      dynamicBypassIp = remoteConfig.bypassTunnelIp;
      console.log('✅ Updated BYPASS_TUNNEL_IP from Firebase:', dynamicBypassIp);
    }
    
    if (remoteConfig.backendUrl) {
      return { success: true, url: dynamicBackendUrl, bypassIp: dynamicBypassIp };
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
