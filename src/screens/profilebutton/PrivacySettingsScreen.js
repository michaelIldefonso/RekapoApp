import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Switch,
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

  const [trainingConsent, setTrainingConsent] = useState(false);

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
        {/* Training Data Consent Toggle */}
        <View style={[
          PrivacySettingsScreenStyles.consentCard,
          { backgroundColor: isDarkMode ? '#333' : '#fff',
            shadowOpacity: isDarkMode ? 0 : 0.08,
            elevation: isDarkMode ? 0 : 2 }
        ]}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[
              PrivacySettingsScreenStyles.consentTitle,
              isDarkMode && { color: '#fff' }
            ]}>
              Training Data Consent
            </Text>
            <Text style={[
              PrivacySettingsScreenStyles.consentSubtitle,
              isDarkMode && { color: '#bbb' }
            ]}>
              Allow your data to be used to improve AI models
            </Text>
          </View>
          <Switch
            value={trainingConsent}
            onValueChange={setTrainingConsent}
            trackColor={{ false: '#ccc', true: '#007AFF' }}
            thumbColor={trainingConsent ? '#fff' : '#f4f3f4'}
            style={{ marginLeft: 8 }}
          />
        </View>
        {/* Add your privacy settings content here */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacySettingsScreen;
