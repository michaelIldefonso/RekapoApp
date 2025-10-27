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

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Main':
        return <MainScreen onNavigate={handleNavigate} />;
      case 'SessionHistory':
        return <SessionHistoryScreen />;
      case 'StartMeeting':
        return <StartMeetingScreen />;
      case 'Profile':
        return <ProfileScreen onLogout={handleLogout} />;
      default:
        return <MainScreen onNavigate={handleNavigate} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
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
