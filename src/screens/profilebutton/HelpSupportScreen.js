import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import HelpSupportScreenStyles from '../../styles/profilebuttonstyles/HelpSupportScreenStyles';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import BackButton from '../../components/BackButton';

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

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={HelpSupportScreenStyles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BackButton isDarkMode={isDarkMode} onPress={() => onNavigate('Profile')} />
            <Text style={titleStyle}>Help & Support</Text>
          </View>
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
