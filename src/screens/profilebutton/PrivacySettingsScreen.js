import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import PrivacySettingsScreenStyles from '../../styles/profilebuttonstyles/PrivacySettingsScreenStyles';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import BackButton from '../../components/BackButton';

const PrivacySettingsScreen = ({ isDarkMode, onToggleDarkMode, onNavigate }) => {
  // Dynamic styles for dark mode
  const containerStyle = [
    PrivacySettingsScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const titleStyle = [
    PrivacySettingsScreenStyles.title,
    isDarkMode && { color: '#fff' },
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={PrivacySettingsScreenStyles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BackButton isDarkMode={isDarkMode} onPress={() => onNavigate('Profile')} />
            <Text style={titleStyle}>Privacy Settings</Text>
          </View>
          <View style={PrivacySettingsScreenStyles.themeToggleButtonWrapper}>
            <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          </View>
        </View>
        {/* Add your privacy settings content here */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacySettingsScreen;
