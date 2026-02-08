import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import PrivacySettingsScreenStyles from '../../styles/profilebuttonstyles/PrivacySettingsScreenStyles';
import { BackHandler } from 'react-native';
import { updateUserConsent, getUserProfile } from '../../services/apiService';
import { getStoredUser } from '../../services/authService';

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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch consent setting from stored user data
  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const user = await getStoredUser();
        if (user && user.data_usage_consent !== undefined) {
          setTrainingConsent(user.data_usage_consent);
        }
      } catch (error) {
        console.error('Failed to fetch consent:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsent();
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      onNavigate('Profile');
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onNavigate]);

  const handleConsentChange = async (value) => {
    setUpdating(true);
    setTrainingConsent(value);
    
    try {
      const result = await updateUserConsent(value);
      if (!result.success) {
        // Revert on failure
        setTrainingConsent(!value);
        console.error('Failed to update consent:', result.error);
      }
    } catch (error) {
      // Revert on error
      setTrainingConsent(!value);
      console.error('Error updating consent:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={PrivacySettingsScreenStyles.content}>
        <Text style={titleStyle}>Privacy Settings</Text>
        {/* Training Data Consent Toggle */}
        {loading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#007AFF'} />
          </View>
        ) : (
          <View style={[
            PrivacySettingsScreenStyles.consentCard,
            { backgroundColor: isDarkMode ? '#333' : '#fff',
              borderColor: isDarkMode ? '#444444' : undefined,
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
            {updating ? (
              <ActivityIndicator size="small" color={isDarkMode ? '#fff' : '#007AFF'} />
            ) : (
              <Switch
                value={trainingConsent}
                onValueChange={handleConsentChange}
                trackColor={{ false: '#ccc', true: '#007AFF' }}
                thumbColor={trainingConsent ? '#fff' : '#f4f3f4'}
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        )}
        {/* Add your privacy settings content here */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacySettingsScreen;
