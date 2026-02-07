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

const LoginScreen = ({ onLogin, isDarkMode, onToggleDarkMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [loginResult, setLoginResult] = useState(null);

  // Google Sign-In is now configured in App.js before this component loads

  // Handler for Google login button
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
        
        Alert.alert(
          'Login Failed',
          result.error || 'Unable to sign in with Google. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      // Always clear loading state on error
      setIsLoading(false);
      
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Login error:', error);
    }
  };

  // Choose styles for dark mode
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
      {/* Theme toggle button at upper right */}

      <View style={{ position: 'absolute', top: 10, right: 16, zIndex: 10 }}>
        <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
      </View>
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