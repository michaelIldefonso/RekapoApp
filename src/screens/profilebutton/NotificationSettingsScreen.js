import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import NotificationSettingsScreenStyles from '../../styles/profilebuttonstyles/NotificationSettingsScreenStyles';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const NotificationSettingsScreen = ({ isDarkMode, onToggleDarkMode, onNavigate }) => {
  // Dynamic styles for dark mode
  const containerStyle = [
    NotificationSettingsScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const titleStyle = [
    NotificationSettingsScreenStyles.title,
    isDarkMode && { color: '#fff' },
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={NotificationSettingsScreenStyles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={titleStyle}>Notification Settings</Text>
          <View style={NotificationSettingsScreenStyles.themeToggleButtonWrapper}>
            <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          </View>
        </View>
        {/* Add your notification settings content here */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;
