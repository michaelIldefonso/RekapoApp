import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, AppState, Alert, Modal, TouchableOpacity, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { isAuthenticated, getStoredUser, getStoredToken, configureGoogleSignIn } from './src/services/authService';
import { fetchDynamicConfig } from './src/config/app.config';
import logger from './src/utils/logger';

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
  const [navigationLock, setNavigationLock] = useState({ isLocked: false, screen: null });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [navigationParams, setNavigationParams] = useState({});
  const [showNavLockAlert, setShowNavLockAlert] = useState(false);

  // Flush logs when app goes to background or closes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is going to background - flush any pending logs
        logger.flush().catch(err => console.log('Log flush error:', err));
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Check authentication status on app startup
  useEffect(() => {
    const initApp = async () => {
      // Load dark mode preference from storage
      try {
        const storedDarkMode = await SecureStore.getItemAsync('dark_mode');
        if (storedDarkMode === 'true') {
          setIsDarkMode(true);
        }
      } catch (error) {
        console.log('Could not load dark mode preference:', error);
      }
      
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
    if (
      navigationLock.isLocked &&
      navigationLock.screen &&
      screen !== navigationLock.screen
    ) {
      logger.log('Navigation blocked by active lock', {
        lockedScreen: navigationLock.screen,
        attemptedScreen: screen,
      });
      setShowNavLockAlert(true);
      return;
    }

    setActiveScreen(screen);
    setNavigationParams(params);
  };

  const handleSetNavigationLock = (screen, isLocked) => {
    setNavigationLock((prev) => {
      if (isLocked) {
        return { isLocked: true, screen };
      }

      if (prev.screen === screen || !screen) {
        return { isLocked: false, screen: null };
      }

      return prev;
    });
  };

  // Handler to update dark mode from any screen
  const handleDarkModeChange = async (value) => {
    setIsDarkMode(value);
    await SecureStore.setItemAsync('dark_mode', value ? 'true' : 'false');
  };

  // Handler to toggle dark mode
  const handleToggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await SecureStore.setItemAsync('dark_mode', newValue ? 'true' : 'false');
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
        return (
          <StartRecord
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            route={{ params: navigationParams }}
            navigation={navigation}
            onSetNavigationLock={(isLocked) => handleSetNavigationLock('StartRecord', isLocked)}
            onForceNavigate={(screen) => {
              setNavigationLock({ isLocked: false, screen: null });
              setActiveScreen(screen);
            }}
          />
        );
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
        navigationLocked={navigationLock.isLocked}
        lockedScreen={navigationLock.screen}
      />

      {/* Themed Navigation Lock Alert */}
      <Modal
        transparent
        visible={showNavLockAlert}
        animationType="fade"
        onRequestClose={() => setShowNavLockAlert(false)}
      >
        <TouchableOpacity
          style={[
            styles.alertOverlay,
            isDarkMode && { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
          ]}
          activeOpacity={1}
          onPress={() => setShowNavLockAlert(false)}
        >
          <View
            style={[
              styles.alertBox,
              isDarkMode && {
                backgroundColor: '#333',
                borderColor: '#555',
              },
            ]}
          >
            <Text
              style={[
                styles.alertTitle,
                isDarkMode && { color: '#fff' },
              ]}
            >
              🎙️ Recording in Progress
            </Text>
            <Text
              style={[
                styles.alertMessage,
                isDarkMode && { color: '#bbb' },
              ]}
            >
              Stop recording before leaving this screen.
            </Text>
            <TouchableOpacity
              style={[
                styles.alertButton,
                isDarkMode && { backgroundColor: '#0066CC' },
              ]}
              onPress={() => setShowNavLockAlert(false)}
            >
              <Text
                style={[
                  styles.alertButtonText,
                  isDarkMode && { color: '#fff' },
                ]}
              >
                Got it
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  alertOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    gap: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  alertButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
