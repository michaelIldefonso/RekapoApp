import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import AboutScreenStyles from '../../styles/profilebuttonstyles/AboutScreenStyles';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { BackHandler } from 'react-native';

const AboutScreen = ({ isDarkMode, onToggleDarkMode, onNavigate }) => {
  // Dynamic styles for dark mode
  const containerStyle = [
    AboutScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const titleStyle = [
    AboutScreenStyles.title,
    isDarkMode && { color: '#fff' },
  ];

  useEffect(() => {
    const onBackPress = () => {
      onNavigate('Profile');
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onNavigate]);

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={AboutScreenStyles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={titleStyle}>About</Text>
          <View style={AboutScreenStyles.themeToggleButtonWrapper}>
            <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          </View>
        </View>

        {/* Logo */}
        <View style={AboutScreenStyles.logoContainer}>
          <Image
            source={require('../../../assets/icon.png')}
            style={AboutScreenStyles.logo}
          />
        </View>

        {/* Main Title */}
        <Text style={[AboutScreenStyles.mainTitle, isDarkMode && { color: '#fff' }]}>
          Rekapo
        </Text>

        {/* Description */}
        <Text style={[AboutScreenStyles.description, isDarkMode && { color: '#ddd' }]}>
          Near Real-time meeting summarization with ML — supports English & Tagalog Code-Switching
        </Text>

        {/* Version */}
        <Text style={[AboutScreenStyles.versionText, isDarkMode && { color: '#999' }]}>
          Version 0.1 (Beta)
        </Text>

        {/* Credits */}
        <Text style={[AboutScreenStyles.creditsTitle, isDarkMode && { color: '#fff' }]}>
          Developed by
        </Text>
        <Text style={[AboutScreenStyles.creditsText, isDarkMode && { color: '#ddd' }]}>
          Michael S. Ildefonso, Miko A. Bataller, Marvin Orlina, and Je'an Rafael Mollasgo
        </Text>

        {/* Institution */}
        <Text style={[AboutScreenStyles.creditsText, isDarkMode && { color: '#ddd' }]}>
          ACLC College of Taytay — 2026
        </Text>

        {/* Copyright */}
        <Text style={[AboutScreenStyles.copyrightText, isDarkMode && { color: '#666' }]}>
          © 2026 Ildefonso, Bataller, Orlina, Mollasgo. All Rights Reserved.
        </Text>

        {/* Disclaimer */}
        <Text style={[AboutScreenStyles.disclaimerText, isDarkMode && { color: '#ff6b6b' }]}>
          This is a test application and is not intended for commercial use.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
