import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import PrivacySettingsScreenStyles from '../../styles/profilebuttonstyles/PrivacySettingsScreenStyles';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { BackHandler } from 'react-native';

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
      <ScrollView style={PrivacySettingsScreenStyles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={titleStyle}>Privacy Settings</Text>
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
