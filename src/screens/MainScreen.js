/**
 * MainScreen.js — Dashboard / Home Screen
 *
 * This is the main landing screen after login. It shows:
 *   - A welcome greeting with the user’s name
 *   - A hero card describing the app’s purpose (intelligent meeting recorder)
 *   - Quick-access feature cards:
 *     1. Start Recording  → navigates to StartMeetingScreen
 *     2. View History     → navigates to SessionHistoryScreen
 *     3. Auto-Translate   → shows an info popup explaining translation
 *   - A “Pro Tip” info card about automatic saving
 *
 * This screen is mostly informational and serves as the navigation hub.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import MainScreenStyles from '../styles/MainScreenStyles';
import { getStoredUser } from '../services/authService';
import MessagePopup from '../components/popup/MessagePopup';

const MainScreen = ({ onNavigate, isDarkMode, onToggleDarkMode }) => {
  const [userInfo, setUserInfo] = useState(null);              // Stores current user data for greeting
  const [showTranslationInfo, setShowTranslationInfo] = useState(false); // Controls translation info popup

  // Load user data from AsyncStorage on mount to display welcome message
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
      // User data load failures are typically non-critical
      // User can still navigate to profile to reload
    }
  };

  // Handler to toggle theme mode
  const handleToggleTheme = () => {
    console.log('Theme toggle pressed'); // Debug log
    onToggleDarkMode(); // Use the app-level toggle handler
  };

  // Dynamic styles: merge base styles with dark mode overrides when isDarkMode is true
  const containerStyle = [
    MainScreenStyles.container,
    isDarkMode && MainScreenStyles.containerDark,
  ];
  const titleStyle = [
    MainScreenStyles.title,
    isDarkMode && MainScreenStyles.titleDark,
  ];
  const subtitleStyle = [
    MainScreenStyles.subtitle,
    isDarkMode && MainScreenStyles.subtitleDark,
  ];
  const heroCardStyle = [
    MainScreenStyles.heroCard,
    isDarkMode && MainScreenStyles.heroCardDark,
  ];
  const sectionTitleStyle = [
    MainScreenStyles.sectionTitle,
    isDarkMode && MainScreenStyles.sectionTitleDark,
  ];
  const featureBoxStyle = [
    MainScreenStyles.featureBox,
    isDarkMode && MainScreenStyles.featureBoxDark,
  ];
  const featureBoxStyleAlt = [
    MainScreenStyles.featureBoxAlt,
    isDarkMode && MainScreenStyles.featureBoxDark,
  ];
  const featureTextStyle = [
    MainScreenStyles.featureText,
    isDarkMode && MainScreenStyles.featureTextDark,
  ];
  const featureSubtextStyle = [
    MainScreenStyles.featureSubtext,
    isDarkMode && MainScreenStyles.featureSubtextDark,
  ];
  const featureArrowStyle = [
    MainScreenStyles.featureArrow,
    isDarkMode && MainScreenStyles.featureArrowDark,
  ];
  const infoCardStyle = [
    MainScreenStyles.infoCard,
    isDarkMode && MainScreenStyles.infoCardDark,
  ];
  const infoTitleStyle = [
    MainScreenStyles.infoTitle,
    isDarkMode && MainScreenStyles.infoTitleDark,
  ];
  const infoTextStyle = [
    MainScreenStyles.infoText,
    isDarkMode && MainScreenStyles.infoTextDark,
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={MainScreenStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Text style={titleStyle}>Dashboard</Text>
          {userInfo && (
            <Text style={[subtitleStyle, { marginTop: 4 }]}>
              Welcome back, {userInfo.username || userInfo.name?.split(' ')[0] || 'User'}!
            </Text>
          )}
        </View>

        {/* Hero Card */}
        <View style={heroCardStyle}>
          <Text style={[MainScreenStyles.heroTitle, isDarkMode && { color: '#007AFF' }]}>
            🎙️ Intelligent Meeting Recorder
          </Text>
          <Text style={[MainScreenStyles.heroDescription, isDarkMode && { color: '#ccc' }]}>
            Record, transcribe, and organize your meetings with AI-powered speech recognition.
          </Text>
          <Text style={[MainScreenStyles.heroSubtext, isDarkMode && { color: '#007AFF' }]}>
            Supports English and Taglish conversations.
          </Text>
          <Text style={[MainScreenStyles.consentNotice, isDarkMode && { color: '#999' }]}>
            📊 Training data consent is enabled by default. Manage in Profile → Privacy Settings.
          </Text>
        </View>

        {/* Features Section */}
        <Text style={sectionTitleStyle}>
          ✨ Key Features
        </Text>

        {/* Feature 1 */}
        <TouchableOpacity onPress={() => onNavigate('StartMeeting')} activeOpacity={0.7}>
          <View style={featureBoxStyle}>
            <Text style={MainScreenStyles.featureIcon}>🎙️</Text>
            <View style={MainScreenStyles.featureContent}>
              <Text style={featureTextStyle}>Start Recording</Text>
              <Text style={featureSubtextStyle}>
                Tap to begin a new meeting
              </Text>
            </View>
            <Text style={featureArrowStyle}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Feature 2 */}
        <TouchableOpacity onPress={() => onNavigate('SessionHistory')} activeOpacity={0.7}>
          <View style={featureBoxStyleAlt}>
            <Text style={MainScreenStyles.featureIcon}>📋</Text>
            <View style={MainScreenStyles.featureContent}>
              <Text style={featureTextStyle}>View History</Text>
              <Text style={featureSubtextStyle}>
                Browse past recordings & summaries
              </Text>
            </View>
            <Text style={featureArrowStyle}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Feature 3 */}
        <TouchableOpacity onPress={() => setShowTranslationInfo(true)} activeOpacity={0.7}>
          <View style={[featureBoxStyle, { marginBottom: 24 }]}>
            <Text style={MainScreenStyles.featureIcon}>🔄</Text>
            <View style={MainScreenStyles.featureContent}>
              <Text style={featureTextStyle}>Auto-Translate</Text>
              <Text style={featureSubtextStyle}>
                Tap to learn how it works
              </Text>
            </View>
            <Text style={featureArrowStyle}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={infoCardStyle}>
          <Text style={infoTitleStyle}>💡 Pro Tip</Text>
          <Text style={infoTextStyle}>
            Your recordings are automatically saved and can be accessed anytime from your Session History. Each recording includes AI-generated summaries and full transcripts.
          </Text>
        </View>
      </ScrollView>

      <MessagePopup
        visible={showTranslationInfo}
        title="Auto-Translate"
        message="Translation is automatic. Each segment card shows English by default. Tap a segment to flip and see the original transcription."
        onClose={() => setShowTranslationInfo(false)}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};



export default MainScreen;