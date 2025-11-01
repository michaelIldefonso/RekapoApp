// Authentication Service
// Handles Google Sign-In and backend JWT token management
// Security: JWT stored in encrypted storage, user data in regular storage

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import config from '../config/app.config';

// Configure Google Sign-In
// Web Client ID is used for backend verification
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: config.GOOGLE_WEB_CLIENT_ID, // From Google Cloud Console - OAuth 2.0 Web client
    offlineAccess: true, // Get refresh token
    forceCodeForRefreshToken: true,
  });
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices();
    
    // Get user info and ID token from Google
    const userInfo = await GoogleSignin.signIn();
    
    // Get the ID token to send to backend
    const tokens = await GoogleSignin.getTokens();
    
    return {
      success: true,
      user: userInfo.user,
      idToken: tokens.idToken, // Send this to your backend for verification
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Send ID token to backend and get JWT
export const verifyWithBackend = async (idToken) => {
  try {
    const response = await fetch(`${config.BACKEND_URL}/api/auth/google-mobile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_token: idToken, // Backend expects 'id_token' not 'idToken'
        data_usage_consent: true, // Required by your backend
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // 🔒 SECURITY: Store JWT in ENCRYPTED storage
      await SecureStore.setItemAsync(config.JWT_TOKEN_KEY, data.access_token);
      
      // 📦 Store only non-sensitive user data in regular storage (for performance)
      const publicUserData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        profile_picture_path: data.user.profile_picture_path,
        google_id: data.user.google_id,
        created_at: data.user.created_at,
        data_usage_consent: data.user.data_usage_consent,
      };
      await AsyncStorage.setItem(config.USER_DATA_KEY, JSON.stringify(publicUserData));
      
      return {
        success: true,
        token: data.access_token,
        user: publicUserData,
      };
    } else {
      return {
        success: false,
        error: data.detail || 'Backend verification failed',
      };
    }
  } catch (error) {
    console.error('Backend verification error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Complete Google login flow
export const handleGoogleLogin = async () => {
  try {
    // Step 1: Sign in with Google
    const googleResult = await signInWithGoogle();
    
    if (!googleResult.success) {
      return googleResult;
    }

    // Step 2: Verify with backend and get JWT
    const backendResult = await verifyWithBackend(googleResult.idToken);
    
    return backendResult;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Sign out
export const signOut = async () => {
  try {
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
