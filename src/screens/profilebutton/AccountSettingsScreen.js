import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import AccountSettingsScreenStyles from '../../styles/profilebuttonstyles/AccountSettingsScreenStyles';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const AccountSettingsScreen = ({ isDarkMode, onToggleDarkMode, onNavigate }) => {
  // Dynamic styles for dark mode
  const containerStyle = [
    AccountSettingsScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const titleStyle = [
    AccountSettingsScreenStyles.title,
    isDarkMode && { color: '#fff' },
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={AccountSettingsScreenStyles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={titleStyle}>Account Settings</Text>
          <View style={AccountSettingsScreenStyles.themeToggleButtonWrapper}>
            <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          </View>
        </View>
        {/* Add your account settings content here */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountSettingsScreen;
