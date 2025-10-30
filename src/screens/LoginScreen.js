import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import LoginScreenStyles from '../styles/LoginScreenStyles';

const LoginScreen = ({ onLogin }) => {
  const handleGoogleLogin = () => {
    // Google OAuth2 login logic would go here
    // For now, just navigate to main screens
    onLogin();
  };

  return (
    <SafeAreaView style={LoginScreenStyles.container}>
      <View style={LoginScreenStyles.content}>
        <View style={LoginScreenStyles.logoContainer}>
          <Text style={LoginScreenStyles.logoText}>🎙️</Text>
          <Text style={LoginScreenStyles.title}>Welcome to Rekapo</Text>
          <Text style={LoginScreenStyles.subtitle}>Your smart meeting companion</Text>
        </View>

        <View style={LoginScreenStyles.loginContainer}>
          <Text style={LoginScreenStyles.loginTitle}>Sign in to get started</Text>
          
          <TouchableOpacity style={LoginScreenStyles.googleButton} onPress={handleGoogleLogin}>
            <View style={LoginScreenStyles.googleButtonContent}>
              <View style={LoginScreenStyles.googleIcon}>
                <Text style={LoginScreenStyles.googleIconText}>G</Text>
              </View>
              <Text style={LoginScreenStyles.googleButtonText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>
            </View>

        <View style={LoginScreenStyles.footerContainer}>
          <Text style={LoginScreenStyles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={LoginScreenStyles.linkText}>Terms of Service</Text> and{' '}
            <Text style={LoginScreenStyles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};



export default LoginScreen;