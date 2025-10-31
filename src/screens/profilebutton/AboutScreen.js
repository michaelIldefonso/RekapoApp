import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import AboutScreenStyles from '../../styles/profilebuttonstyles/AboutScreenStyles';
import ThemeToggleButton from '../../components/ThemeToggleButton';

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
