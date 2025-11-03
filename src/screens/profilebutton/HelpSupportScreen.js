import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import HelpSupportScreenStyles from '../../styles/profilebuttonstyles/HelpSupportScreenStyles';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { BackHandler } from 'react-native';

const HelpSupportScreen = ({ isDarkMode, onToggleDarkMode, onNavigate }) => {
  // Dynamic styles for dark mode
  const containerStyle = [
    HelpSupportScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const titleStyle = [
    HelpSupportScreenStyles.title,
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
      <ScrollView style={HelpSupportScreenStyles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={titleStyle}>Help & Support</Text>
          <View style={HelpSupportScreenStyles.themeToggleButtonWrapper}>
            <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          </View>
        </View>
        {/* Add your help & support content here */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupportScreen;
