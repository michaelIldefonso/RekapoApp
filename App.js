/**
 * App.js — Root Component of the Rekapo Application
 *
 * This is the main entry point of the app. It manages:
 *   - Authentication state (login/logout with Google OAuth + JWT)
 *   - Screen navigation (custom screen-switcher instead of React Navigation)
 *   - Dark mode theme toggling (persisted in SecureStore)
 *   - Navigation lock (prevents leaving the recording screen mid-recording)
 *   - Log flushing when the app goes to background
 *
 * The app uses a simple state-driven navigation approach:
 *   activeScreen state determines which screen component is rendered.
 *   BottomNavigation provides tab-based navigation at the bottom.
 */
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, AppState, Alert, Modal, TouchableOpacity, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // Encrypted storage for sensitive data (dark mode pref)
import { isAuthenticated, getStoredUser, getStoredToken, configureGoogleSignIn } from './src/services/authService';
import { fetchDynamicConfig } from './src/config/app.config'; // Fetches backend URL from Firebase Remote Config
import logger from './src/utils/logger'; // Custom logger that sends logs to backend in production

// Import all app screens — each screen is a standalone component
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';             // Dashboard / home screen
import SessionHistoryScreen from './src/screens/SessionHistoryScreen'; // List of past recordings
import SessionDetailsScreen from './src/screens/SessionDetailsScreen'; // View transcript, summary, export
import StartMeetingScreen from './src/screens/StartMeetingScreen';     // Set meeting title before recording
import StartRecord from './src/screens/StartRecord';                   // Live recording + real-time transcription
import ProfileScreen from './src/screens/ProfileScreen';               // User profile + settings menu
import AccountSettingsScreen from './src/screens/profilebutton/AccountSettingsScreen'; // Change username/photo
import PrivacySettingsScreen from './src/screens/profilebutton/PrivacySettingsScreen'; // Training data consent toggle
import AboutScreen from './src/screens/profilebutton/AboutScreen';     // App info and credits

// Bottom tab bar component
import BottomNavigation from './src/components/BottomNavigation';

export default function App() {
  // ── Core App State ──────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(false);        // Whether user is authenticated
  const [activeScreen, setActiveScreen] = useState('Main');   // Currently displayed screen name
  const [navigationLock, setNavigationLock] = useState({ isLocked: false, screen: null }); // Prevents nav during recording
  const [isDarkMode, setIsDarkMode] = useState(false);        // Theme toggle state
  const [userData, setUserData] = useState(null);             // Logged-in user info (name, email, etc.)
  const [jwtToken, setJwtToken] = useState(null);             // JWT token for API authentication
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Shows loading spinner while verifying auth
  const [navigationParams, setNavigationParams] = useState({}); // Params passed between screens (e.g., sessionId)
  const [showNavLockAlert, setShowNavLockAlert] = useState(false); // Controls "recording in progress" alert modal

  // ── Effect: Flush buffered logs when app goes to background ─────────
  // In production, logs are batched and sent every 10s. This ensures
  // any remaining buffered logs get sent before the OS suspends the app.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        logger.flush().catch(err => console.log('Log flush error:', err));
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // ── Effect: App Initialization (runs once on mount) ─────────────────
  // 1. Load persisted dark mode preference from encrypted storage
  // 2. Configure Google Sign-In SDK with our OAuth Web Client ID
  // 3. Fetch the latest backend URL from Firebase Remote Config
  // 4. Verify if the stored JWT token is still valid (auto-login)
  useEffect(() => {
    const initApp = async () => {
      // Restore theme preference
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

  // Checks if the user has a valid (non-expired) JWT token stored.
  // If yes, auto-logs them in. If no, they'll see LoginScreen.
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

  // Called after successful Google login + backend JWT verification
  const handleLogin = (user, token) => {
    setUserData(user);
    setJwtToken(token);
    setIsLoggedIn(true);
  };

  // Called when user confirms logout — clears all auth state and returns to login
  const handleLogout = () => {
    setUserData(null);
    setJwtToken(null);
    setIsLoggedIn(false);
    setActiveScreen('Main');
  };

  // Central navigation handler — all screen changes go through here.
  // If recording is active (navigation locked), it blocks navigation
  // and shows an alert telling the user to stop recording first.
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

  // Lock/unlock navigation — used by StartRecord to prevent accidental exits during recording
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

  // Explicitly set dark mode to a specific value and persist to storage
  const handleDarkModeChange = async (value) => {
    setIsDarkMode(value);
    await SecureStore.setItemAsync('dark_mode', value ? 'true' : 'false');
  };

  // Toggle dark mode on/off and persist the preference to SecureStore
  const handleToggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await SecureStore.setItemAsync('dark_mode', newValue ? 'true' : 'false');
  };

  // ── Loading State: Show spinner while verifying stored JWT on startup ──
  if (isCheckingAuth) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // ── Screen Router ────────────────────────────────────────────────────
  // This acts as a simple screen router (instead of React Navigation library).
  // Based on the activeScreen state value, it renders the corresponding screen
  // component and passes shared props (dark mode, navigation handlers, etc.).
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

      {/* Modal alert that appears when user tries to navigate away during an active recording */}
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
