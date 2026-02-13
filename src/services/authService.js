// Authentication Service
// Handles Google Sign-In and backend JWT token management
// Security: JWT stored in encrypted storage, user data in regular storage

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import config from '../config/app.config';
import logger from '../utils/logger';

// Configure Google Sign-In
// Web Client ID is used for backend verification
// Note: Backend uses long-lived JWT tokens (not Google refresh tokens)
export const configureGoogleSignIn = () => {
  console.log('⚙️ Configuring Google Sign-In...');
  console.log('🔑 Web Client ID:', config.GOOGLE_WEB_CLIENT_ID ? 'Present' : 'MISSING!');
  
  if (!config.GOOGLE_WEB_CLIENT_ID) {
    console.error('❌ GOOGLE_WEB_CLIENT_ID is not set in config!');
    return;
  }
  
  try {
    GoogleSignin.configure({
      webClientId: config.GOOGLE_WEB_CLIENT_ID, // From Google Cloud Console - OAuth 2.0 Web client
      offlineAccess: false, // Only request ID token, not refresh token
      // If your device works with offlineAccess:true, that's fine - the backend ignores the refresh token
      // But some devices get stuck when requesting offline access, so keeping it disabled
    });
    console.log('✅ Google Sign-In configured successfully');
  } catch (error) {
    console.error('❌ Error configuring Google Sign-In:', error);
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.log('🔍 Checking Google Play Services...');
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log('✅ Google Play Services available');
    
    // Don't try to sign out before sign in - causes "apiClient is null" error
    // The library will handle existing sessions automatically
    
    // Get user info and ID token from Google
    console.log('🚀 Starting Google sign-in...');
    const userInfo = await GoogleSignin.signIn();
    console.log('✅ Got response from Google');
    console.log('📦 Response structure:', JSON.stringify(userInfo, null, 2));
    
    // Validate that we got the expected data
    // The response structure might be different - check both userInfo.user and userInfo.data
    const user = userInfo?.user || userInfo?.data?.user || userInfo;
    
    if (!user) {
      console.error('❌ No user data in response');
      throw new Error('Failed to get user information from Google');
    }
    
    console.log('👤 User data:', JSON.stringify(user, null, 2));
    
    // Get the ID token to send to backend
    console.log('🔑 Getting ID token...');
    const tokens = await GoogleSignin.getTokens();
    console.log('✅ Got tokens');
    console.log('🔑 Tokens structure:', JSON.stringify(tokens, null, 2));
    
    if (!tokens || !tokens.idToken) {
      throw new Error('Failed to get authentication token from Google');
    }
    
    logger.log('User signed in with Google successfully');
    return {
      success: true,
      user: user,
      idToken: tokens.idToken, // Send this to your backend for verification
    };
  } catch (error) {
    logger.error('Google Sign-In failed:', error.code || error.message);
    console.error('❌ Google Sign-In Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      errorMessage = 'Google Play Services is not available on this device';
    } else if (error.code === 'SIGN_IN_CANCELLED') {
      errorMessage = 'Sign in was cancelled';
    } else if (error.code === 'IN_PROGRESS') {
      errorMessage = 'Sign in is already in progress';
    } else if (error.code === 'SIGN_IN_REQUIRED') {
      errorMessage = 'Please sign in again';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
    };
  }
};

// Send ID token to backend and get JWT
export const verifyWithBackend = async (idToken) => {
  const startTime = Date.now();
  try {
    console.log('🌐 Connecting to backend:', config.BACKEND_URL);
    logger.networkStart('POST', '/auth/google-mobile');
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏱️ Backend request timeout after 15 seconds');
      controller.abort();
    }, 15000); // 15 second timeout
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add bypass tunnel header if configured
    if (config.BYPASS_TUNNEL_IP) {
      headers['Bypass-Tunnel-Reminder'] = config.BYPASS_TUNNEL_IP;
    }
    
    const response = await fetch(`${config.BACKEND_URL}/api/auth/google-mobile`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        id_token: idToken, // Backend expects 'id_token' not 'idToken'
        data_usage_consent: true, // Required by your backend
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const elapsed = Date.now() - startTime;
    console.log(`⏱️ Backend responded in ${elapsed}ms`);
    logger.networkResponse('POST', '/auth/google-mobile', response.status, elapsed);
    
    const data = await response.json();

    if (response.ok) {
      // Validate response data
      if (!data.access_token || !data.user) {
        throw new Error('Invalid response from server');
      }
      
      console.log('💾 Storing user data and token...');
      
      // 🔒 SECURITY: Store JWT in ENCRYPTED storage
      await SecureStore.setItemAsync(config.JWT_TOKEN_KEY, data.access_token);
      
      // Fix profile picture path if it's relative (from backend)
      let profilePicturePath = data.user.profile_picture_path;
      if (profilePicturePath && !profilePicturePath.startsWith('http')) {
        // It's a relative path from backend upload, construct full URL
        const baseUrl = config.BACKEND_URL.replace('/api', '');
        const separator = profilePicturePath.startsWith('/') ? '' : '/';
        profilePicturePath = `${baseUrl}${separator}${profilePicturePath}`;
        console.log('🔗 Converted relative photo path to full URL:', profilePicturePath);
      }
      
      // 📦 Store only non-sensitive user data in regular storage (for performance)
      const publicUserData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        username: data.user.username, // ← User's custom username (different from Google name)
        profile_picture_path: profilePicturePath,
        google_id: data.user.google_id,
        created_at: data.user.created_at,
        data_usage_consent: data.user.data_usage_consent,
      };
      await AsyncStorage.setItem(config.USER_DATA_KEY, JSON.stringify(publicUserData));
      
      console.log('✅ User data stored successfully');
      logger.log('User authenticated successfully with backend');
      
      return {
        success: true,
        token: data.access_token,
        user: publicUserData,
      };
    } else {
      logger.error('Backend authentication failed: ' + (data.detail || data.message || 'Unknown error'));
      logger.networkError('POST', '/auth/google-mobile', data.detail || data.message || 'Backend authentication failed');
      console.error('❌ Backend error:', response.status, data);
      return {
        success: false,
        error: data.detail || data.message || 'Backend verification failed',
      };
    }
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error('Backend verification connection error: ' + error.message);
    console.error(`❌ Backend verification error after ${elapsed}ms:`, error);
    
    let errorMessage = 'Unable to connect to server';
    if (error.name === 'AbortError') {
      errorMessage = 'Connection timeout. Please check your internet connection';
      logger.networkError('POST', '/auth/google-mobile', 'timeout');
    } else if (error.message) {
      errorMessage = error.message;
      logger.networkError('POST', '/auth/google-mobile', error.message);
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Complete Google login flow
export const handleGoogleLogin = async () => {
  try {
    console.log('🔐 Starting Google login flow...');
    
    // Step 1: Sign in with Google
    console.log('📱 Step 1: Authenticating with Google...');
    const googleResult = await signInWithGoogle();
    
    if (!googleResult.success) {
      console.error('❌ Google sign-in failed:', googleResult.error);
      return googleResult;
    }
    
    console.log('✅ Google sign-in successful');
    console.log('👤 User:', googleResult.user.email);

    // Step 2: Verify with backend and get JWT
    console.log('🔄 Step 2: Verifying with backend...');
    const backendResult = await verifyWithBackend(googleResult.idToken);
    
    if (!backendResult.success) {
      console.error('❌ Backend verification failed:', backendResult.error);
    } else {
      console.log('✅ Backend verification successful');
    }
    
    return backendResult;
  } catch (error) {
    console.error('❌ Unexpected error in login flow:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

// Sign out
export const signOut = async () => {
  try {
    logger.log('User signed out');
    await GoogleSignin.signOut();
    // Clear encrypted JWT token
    await SecureStore.deleteItemAsync(config.JWT_TOKEN_KEY);
    // Clear user data
    await AsyncStorage.removeItem(config.USER_DATA_KEY);
    // Clear all other app data
    await AsyncStorage.clear();
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Get stored JWT token (from encrypted storage)
export const getStoredToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(config.JWT_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Get stored user data (from regular storage)
export const getStoredUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(config.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Check if JWT token is expired
export const isTokenExpired = async () => {
  try {
    const token = await getStoredToken();
    if (!token) return true;
    
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    
    // Check if token is expired (with 5 minute buffer)
    return decoded.exp < (currentTime + 300);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if error
  }
};

// Check if user is authenticated and token is valid
export const isAuthenticated = async () => {
  try {
    const token = await getStoredToken();
    if (!token) return false;
    
    const expired = await isTokenExpired();
    return !expired;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};
