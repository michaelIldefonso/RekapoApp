import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import LoginScreenStyles from '../styles/LoginScreenStyles';
import ThemeToggleButton from '../components/ThemeToggleButton';

const LoginScreen = ({ onLogin }) => {
  // State to track if dark mode is enabled
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handler for Google login button
  const handleGoogleLogin = () => {
    // Google OAuth2 login logic would go here
    // For now, just navigate to main screens
    onLogin();
  };

  // Handler to toggle theme mode
  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Choose styles based on theme
  const containerStyle = [
    LoginScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' }, //css for darkmode, background color
  ];
  const googleButtonStyle = [
    LoginScreenStyles.googleButton,
    isDarkMode && { backgroundColor: '#504a4aff' }, // css for darkmode, google button background
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
        <ThemeToggleButton isDarkMode={isDarkMode} onToggle={handleToggleTheme} />
      </View>
      <View style={LoginScreenStyles.content}>
        <View style={LoginScreenStyles.loginContainer}>
          {/* Only logo, no words */}
          <Text style={LoginScreenStyles.logoText}>🎙️</Text>
          <Text style={loginTitleTextStyle}>Sign in to get started</Text>
          <TouchableOpacity style={googleButtonStyle} onPress={handleGoogleLogin}>
            <View style={LoginScreenStyles.googleButtonContent}>
              <View style={googleIconStyle}>
                <Text style={LoginScreenStyles.googleIconText}>G</Text>
              </View>
              <Text style={googleButtonTextStyle}>Continue with Google</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={LoginScreenStyles.footerContainer}>
          <Text style={footerTextStyle}>
            By continuing, you agree to our{' '}
            <Text style={linkTextStyle}>Terms of Service</Text> and{' '}
            <Text style={linkTextStyle}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};



export default LoginScreen;