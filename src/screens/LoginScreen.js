import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';

const LoginScreen = ({ onLogin }) => {
  const handleGoogleLogin = () => {
    // Google OAuth2 login logic would go here
    // For now, just navigate to main screens
    onLogin();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🎙️</Text>
          <Text style={styles.title}>Welcome to Rekapo</Text>
          <Text style={styles.subtitle}>Your smart meeting companion</Text>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Sign in to get started</Text>
          
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <View style={styles.googleButtonContent}>
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>
            </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoText: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7f8c8d',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
    color: '#2c3e50',
  },
  googleButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#4285f4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e8ed',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#7f8c8d',
  },
  emailButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#7f8c8d',
    lineHeight: 18,
  },
  linkText: {
    color: '#3498db',
    fontWeight: '500',
  },
});

export default LoginScreen;