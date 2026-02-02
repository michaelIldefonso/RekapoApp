import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { isAuthenticated, getStoredUser, getStoredToken, configureGoogleSignIn } from './src/services/authService';
import { fetchDynamicConfig } from './src/config/app.config';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import SessionHistoryScreen from './src/screens/SessionHistoryScreen';
import SessionDetailsScreen from './src/screens/SessionDetailsScreen';
import StartMeetingScreen from './src/screens/StartMeetingScreen';
import StartRecord from './src/screens/StartRecord';
import ProfileScreen from './src/screens/ProfileScreen';
import AccountSettingsScreen from './src/screens/profilebutton/AccountSettingsScreen';
import PrivacySettingsScreen from './src/screens/profilebutton/PrivacySettingsScreen';
import AboutScreen from './src/screens/profilebutton/AboutScreen';

// Import components
import BottomNavigation from './src/components/BottomNavigation';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState('Main');
  const [isDarkMode, setIsDarkMode] = useState(false); // App-level dark mode persists across screens
  const [userData, setUserData] = useState(null); // Store user data
  const [jwtToken, setJwtToken] = useState(null); // Store JWT token
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Check auth state on app load
  const [navigationParams, setNavigationParams] = useState({}); // Store navigation parameters

  // Check authentication status on app startup
  useEffect(() => {
    const initApp = async () => {
      // Configure Google Sign-In FIRST before checking auth
      configureGoogleSignIn();
      // Fetch dynamic config from Firebase (for backend URL)
      await fetchDynamicConfig();
      // Now check auth with correct backend URL
      checkAuthStatus();
    };
    
    initApp();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        // Load stored user data and token
        const storedUser = await getStoredUser();
        const storedToken = await getStoredToken();
        
        if (storedUser && storedToken) {
          setUserData(storedUser);
          setJwtToken(storedToken);
          setIsLoggedIn(true);
          console.log('✅ User is authenticated');
        } else {
          // Authentication check passed but no user data - force re-login
          setIsLoggedIn(false);
          console.log('⚠️ User data missing, requiring re-login');
        }
      } else {
        setIsLoggedIn(false);
        console.log('❌ User is not authenticated or token expired');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = (user, token) => {
    setUserData(user);
    setJwtToken(token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserData(null);
    setJwtToken(null);
    setIsLoggedIn(false);
    setActiveScreen('Main');
  };

  const handleNavigate = (screen, params = {}) => {
    setActiveScreen(screen);
    setNavigationParams(params);
  };

  // Handler to update dark mode from any screen
  const handleDarkModeChange = (value) => {
    setIsDarkMode(value);
  };

  // Handler to toggle dark mode
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // This function determines which screen component to render based on the current activeScreen state.
  // It also passes global props (like isDarkMode, onToggleDarkMode, and navigation handlers) to each screen.
  // This centralizes navigation and shared state management in the app.
  const renderScreen = () => {
    // Create navigation object similar to React Navigation
    const navigation = {
      navigate: handleNavigate,
      goBack: () => handleNavigate('StartMeeting'),
    };

    switch (activeScreen) {
      case 'Main':
        return <MainScreen onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />;
      case 'SessionHistory':
        return <SessionHistoryScreen navigation={navigation} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />;
      case 'SessionDetails':
        return <SessionDetailsScreen route={{ params: navigationParams }} navigation={navigation} isDarkMode={isDarkMode} />;
      case 'StartMeeting':
        return <StartMeetingScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} navigation={navigation} />;
      case 'StartRecord':
        return <StartRecord isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} route={{ params: navigationParams }} navigation={navigation} />;
      case 'Profile':
        return <ProfileScreen onLogout={handleLogout} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onNavigate={handleNavigate} />;
      case 'AccountSettings':
        return <AccountSettingsScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onNavigate={handleNavigate} />;
      case 'PrivacySettings':
        return <PrivacySettingsScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onNavigate={handleNavigate} />;
      case 'About':
        return <AboutScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onNavigate={handleNavigate} />;
      default:
        return <MainScreen onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNavigation 
        activeScreen={activeScreen} 
        onNavigate={handleNavigate} 
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
});
