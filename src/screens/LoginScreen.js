/**
 * LoginScreen.js — Google OAuth Login Screen
 *
 * This is the first screen users see when not authenticated.
 * It handles:
 *   - Google Sign-In via the @react-native-google-signin library
 *   - Sends the Google ID token to our backend for JWT verification
 *   - Displays a welcome popup on successful login
 *   - Shows Terms of Service and Privacy Policy popups
 *   - Supports light/dark mode theming
 *
 * Flow: User taps "Continue with Google" → Google Auth popup →
 *       Backend verifies token → JWT issued → Welcome popup → Main app
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LoginScreenStyles from '../styles/LoginScreenStyles';
import ThemeToggleButton from '../components/ThemeToggleButton';
import WelcomePopup from '../components/popup/WelcomePopup';
import TermsPopup from '../components/popup/TermsPopup';
import PrivacyPopup from '../components/popup/PrivacyPopup';
import { 
  handleGoogleLogin as googleLoginService 
} from '../services/authService';
import logger from '../utils/logger';

const LoginScreen = ({ onLogin, isDarkMode, onToggleDarkMode }) => {
  const [isLoading, setIsLoading] = useState(false);           // Shows spinner on Google button during auth
  const [showWelcomePopup, setShowWelcomePopup] = useState(false); // Controls welcome modal after login
  const [showTermsPopup, setShowTermsPopup] = useState(false);     // Controls Terms of Service modal
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false); // Controls Privacy Policy modal
  const [loginResult, setLoginResult] = useState(null);            // Stores login result (user + token) temporarily

  // Google Sign-In is now configured in App.js before this component loads

  // Handler for Google login button — triggers the full Google → Backend auth flow
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await googleLoginService();
      
      if (result.success) {
        // Log user data to verify profile picture
        console.log('✅ Login successful!');
        console.log('📧 Email:', result.user.email);
        console.log('👤 Name:', result.user.name);
        console.log('📸 Profile Picture:', result.user.profile_picture_path);
        console.log('🆔 User ID:', result.user.id);
        console.log('🔑 JWT Token:', result.token.substring(0, 20) + '...');
        
        // Successfully logged in - show custom welcome popup
        setLoginResult(result);
        setIsLoading(false);
        setShowWelcomePopup(true);
      } else {
        // Login failed - clear loading state immediately
        setIsLoading(false);
        
        // Don't show alert if user cancelled
        if (result.errorCode === 'SIGN_IN_CANCELLED') {
          console.log('User cancelled sign in');
          return;
        }
        logger.error('UI error alert shown', {
          screen: 'Login',
          title: 'Login Failed',
          message: result.error || 'Unable to sign in with Google. Please try again.'
        });
        Alert.alert(
          'Login Failed',
          result.error || 'Unable to sign in with Google. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      // Always clear loading state on error
      setIsLoading(false);
      logger.error('UI error alert shown', {
        screen: 'Login',
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.'
      });
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Login error:', error);
    }
  };

  // Dynamic styles: merge base styles with dark mode overrides
  const containerStyle = [
    LoginScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' }, //css for darkmode, background color oh yiea
  ];
  const googleButtonStyle = [
    LoginScreenStyles.googleButton,
    isDarkMode && { backgroundColor: '#333333' }, // css for darkmode, google button background namia fuckable mouth
  ];
  const googleButtonTextStyle = [
    LoginScreenStyles.googleButtonText,
    isDarkMode && { color: '#bdb6b6ff' },// css for darkmode, google button text color
  ];
  const loginTitleTextStyle = [
    LoginScreenStyles.loginTitle,
    isDarkMode && { color: '#ffffffff' }, // css for darkmode, login title color
  ];
  const footerTextStyle = [
    LoginScreenStyles.footerText,
    isDarkMode && { color: '#bbb' }, //css for darkmode, footer text color
  ];
  const linkTextStyle = [
    LoginScreenStyles.linkText,
    isDarkMode && { color: '#ffffffff' }, //css for darkmode, link text color
  ];
  const googleIconStyle = [
    LoginScreenStyles.googleIcon,
    isDarkMode && { backgroundColor: '#010f5eff' }, // dark mode background for icon
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <View style={LoginScreenStyles.content}>
        <View style={LoginScreenStyles.loginContainer}>
          {/* Only logo, no words */}
          <Text style={LoginScreenStyles.logoText}>🎙️</Text>
          <Text style={loginTitleTextStyle}>Sign in to get started</Text>
          <TouchableOpacity 
            style={googleButtonStyle} 
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <View style={LoginScreenStyles.googleButtonContent}>
              {isLoading ? (
                <ActivityIndicator color={isDarkMode ? '#fff' : '#000'} />
              ) : (
                <>
                  <View style={googleIconStyle}>
                    <Text style={LoginScreenStyles.googleIconText}>G</Text>
                  </View>
                  <Text style={googleButtonTextStyle}>Continue with Google</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={LoginScreenStyles.footerContainer}>
          <Text style={footerTextStyle}>
            By continuing, you agree to our{' '}
          </Text>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setShowTermsPopup(true)} disabled={isLoading}>
              <Text style={linkTextStyle}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={[footerTextStyle, { marginTop: 6 }]}>and</Text>
            <TouchableOpacity onPress={() => setShowPrivacyPopup(true)} disabled={isLoading}>
              <Text style={linkTextStyle}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <WelcomePopup
        visible={showWelcomePopup}
        userName={loginResult?.user?.name}
        onClose={() => {
          setShowWelcomePopup(false);
          onLogin(loginResult);
        }}
        isDarkMode={isDarkMode}
      />

      <TermsPopup
        visible={showTermsPopup}
        onClose={() => setShowTermsPopup(false)}
        isDarkMode={isDarkMode}
      />

      <PrivacyPopup
        visible={showPrivacyPopup}
        onClose={() => setShowPrivacyPopup(false)}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};



export default LoginScreen;