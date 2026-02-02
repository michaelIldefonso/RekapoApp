import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import MainScreenStyles from '../styles/MainScreenStyles';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { getStoredUser } from '../services/authService';

const MainScreen = ({ onNavigate, isDarkMode, onToggleDarkMode }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getStoredUser();
      if (user) {
        setUserInfo(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Handler to toggle theme mode
  const handleToggleTheme = () => {
    console.log('Theme toggle pressed'); // Debug log
    onToggleDarkMode(); // Use the app-level toggle handler
  };

  // Container style for dark mode
  const containerStyle = [
    MainScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' }, //css for darkmode, background color
  ];
  const titleStyle = [
    MainScreenStyles.title,
    isDarkMode && { color: '#ffffffff' },
  ];
  const subtitleStyle = [
    MainScreenStyles.subtitle,
    isDarkMode && { color: '#ffffffff' },
  ];

  // Dynamic styles for cards in dark mode
  const cardStyle = [
    MainScreenStyles.card,
    isDarkMode && { backgroundColor: '#333333', borderColor: '#444444', borderWidth: 1, shadowOpacity: 0.2 },
  ];
  const cardTitleStyle = [
    MainScreenStyles.cardTitle,
    isDarkMode && { color: '#fff' },
  ];
  const cardDescriptionStyle = [
    MainScreenStyles.cardDescription,
    isDarkMode && { color: '#bbb' },
  ];
  const appDescriptionStyle = [
    MainScreenStyles.cardDescription,
    { marginTop: 16, marginBottom: 8, lineHeight: 20 },
    isDarkMode && { color: '#bbb' },
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={MainScreenStyles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={titleStyle}>Dashboard</Text>
            {userInfo && (
              <Text style={[subtitleStyle, { marginTop: 4 }]}>
                Welcome back, {userInfo.username || userInfo.name?.split(' ')[0] || 'User'}!
              </Text>
            )}
          </View>
          <View style={MainScreenStyles.themeToggleButtonWrapper}>
            <ThemeToggleButton isDarkMode={isDarkMode} onToggle={handleToggleTheme} />
          </View>
        </View>

        <Text style={appDescriptionStyle}>
          Record, transcribe, and organize your meetings with AI-powered speech recognition. 
          Supports English and Taglish conversations.
        </Text>

        <View style={MainScreenStyles.cardContainer}>
          <TouchableOpacity
            style={cardStyle}
            onPress={() => onNavigate('StartMeeting')}
          >
            <Text style={cardTitleStyle}>Start New Meeting</Text>
            <Text style={cardDescriptionStyle}>
              Begin a new recording session
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={cardStyle}
            onPress={() => onNavigate('SessionHistory')}
          >
            <Text style={cardTitleStyle}>Session History</Text>
            <Text style={cardDescriptionStyle}>
              View your past recordings
            </Text>
          </TouchableOpacity>
        </View>
  {/* BottomNavigation should be rendered by App.js, not here */}
      </ScrollView>
    </SafeAreaView>
  );
};



export default MainScreen;