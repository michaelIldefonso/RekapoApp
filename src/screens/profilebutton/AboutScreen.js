import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
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
        {/* Add your about content here */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
