import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import SessionHistoryScreen from './src/screens/SessionHistoryScreen';
import StartMeetingScreen from './src/screens/StartMeetingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

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

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Main':
        return <MainScreen onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />;
      case 'SessionHistory':
        return <SessionHistoryScreen />;
      case 'StartMeeting':
        return <StartMeetingScreen />;
      case 'Profile':
        return <ProfileScreen onLogout={handleLogout} />;
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
