import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import SessionHistoryScreen from './src/screens/SessionHistoryScreen';
import StartMeetingScreen from './src/screens/StartMeetingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AccountSettingsScreen from './src/screens/profilebutton/AccountSettingsScreen';
import NotificationSettingsScreen from './src/screens/profilebutton/NotificationSettingsScreen';
import StorageDataScreen from './src/screens/profilebutton/StorageDataScreen';
import PrivacySettingsScreen from './src/screens/profilebutton/PrivacySettingsScreen';
import HelpSupportScreen from './src/screens/profilebutton/HelpSupportScreen';
import AboutScreen from './src/screens/profilebutton/AboutScreen';

// Import components
import BottomNavigation from './src/components/BottomNavigation';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState('Main');
  const [isDarkMode, setIsDarkMode] = useState(false); // App-level dark mode persists across screens

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveScreen('Main');
  };

  const handleNavigate = (screen) => {
    setActiveScreen(screen);
  };

  // Handler to update dark mode from any screen
  const handleDarkModeChange = (value) => {
    setIsDarkMode(value);
  };

  // Handler to toggle dark mode
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // This function determines which screen component to render based on the current activeScreen state.
  // It also passes global props (like isDarkMode, onToggleDarkMode, and navigation handlers) to each screen.
  // This centralizes navigation and shared state management in the app.
  const renderScreen = () => {
    switch (activeScreen) {
      case 'Main':
        return <MainScreen onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />;
      case 'SessionHistory':
        return <SessionHistoryScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />;
      case 'StartMeeting':
        return <StartMeetingScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />;
      case 'Profile':
        return <ProfileScreen onLogout={handleLogout} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onNavigate={handleNavigate} />;
      case 'AccountSettings':
        return <AccountSettingsScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onNavigate={handleNavigate} />;
      case 'NotificationSettings':
        return <NotificationSettingsScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onNavigate={handleNavigate} />;
      case 'StorageData':
        return <StorageDataScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onNavigate={handleNavigate} />;
      case 'PrivacySettings':
        return <PrivacySettingsScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onNavigate={handleNavigate} />;
      case 'HelpSupport':
        return <HelpSupportScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onNavigate={handleNavigate} />;
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
