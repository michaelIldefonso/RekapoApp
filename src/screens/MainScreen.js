import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import MainScreenStyles from '../styles/MainScreenStyles';
import ThemeToggleButton from '../components/ThemeToggleButton';

const MainScreen = ({ onNavigate, isDarkMode, onToggleDarkMode }) => {
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
    isDarkMode && { backgroundColor: '#504a4aff', borderColor: '#ffffffff', borderWidth: 1, shadowOpacity: 0.2 },
  ];
  const cardTitleStyle = [
    MainScreenStyles.cardTitle,
    isDarkMode && { color: '#fff' },
  ];
  const cardDescriptionStyle = [
    MainScreenStyles.cardDescription,
    isDarkMode && { color: '#bbb' },
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={MainScreenStyles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={titleStyle}>Dashboard</Text>
          <ThemeToggleButton isDarkMode={isDarkMode} onToggle={handleToggleTheme} />
        </View>
        <Text style={subtitleStyle}>Welcome back!</Text>

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

          <View style={cardStyle}>
            <Text style={cardTitleStyle}>Recent Activity</Text>
            <Text style={cardDescriptionStyle}>
              No recent sessions
            </Text>
          </View>
        </View>
  {/* BottomNavigation should be rendered by App.js, not here */}
      </ScrollView>
    </SafeAreaView>
  );
};



export default MainScreen;