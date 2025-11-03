import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import AccountSettingsScreenStyles from '../../styles/profilebuttonstyles/AccountSettingsScreenStyles';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { useAccountSettings } from '../../hooks/useAccountSettings';

const AccountSettingsScreen = ({ isDarkMode, onToggleDarkMode, onNavigate }) => {
  const {
    userInfo,
    username,
    setUsername,
    isEditingUsername,
    setIsEditingUsername,
    isLoading,
    isSaving,
    imageRefreshKey,
    handleChangePhoto,
    handleSaveUsername,
  } = useAccountSettings();

  // Dynamic styles for dark mode
  const containerStyle = [
    AccountSettingsScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const titleStyle = [
    AccountSettingsScreenStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  const cardStyle = [
    AccountSettingsScreenStyles.card,
    isDarkMode && { 
      backgroundColor: '#333',
      shadowOpacity: 0,
      elevation: 0,
    },
  ];
  const labelStyle = [
    AccountSettingsScreenStyles.label,
    isDarkMode && { color: '#bbb' },
  ];
  const valueStyle = [
    AccountSettingsScreenStyles.value,
    isDarkMode && { color: '#fff' },
  ];
  const inputStyle = [
    AccountSettingsScreenStyles.input,
    isDarkMode && {
      color: '#fff',
      borderColor: '#555',
      backgroundColor: '#444',
    },
  ];
  const buttonStyle = AccountSettingsScreenStyles.button;
  const buttonTextStyle = AccountSettingsScreenStyles.buttonText;
  const secondaryButtonStyle = [
    AccountSettingsScreenStyles.secondaryButton,
    isDarkMode && { backgroundColor: '#555' },
  ];
  const secondaryButtonTextStyle = [
    AccountSettingsScreenStyles.secondaryButtonText,
    isDarkMode && { color: '#fff' },
  ];
  const helperTextStyle = [
    AccountSettingsScreenStyles.helperText,
    isDarkMode && { color: '#888' },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={containerStyle}>
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView 
        style={AccountSettingsScreenStyles.content}
        contentContainerStyle={AccountSettingsScreenStyles.contentContainer}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={titleStyle}>Account Settings</Text>
          <View style={AccountSettingsScreenStyles.themeToggleButtonWrapper}>
            <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          </View>
        </View>

        {/* Profile Photo Section */}
        <View style={cardStyle}>
          <Text style={labelStyle}>Profile Photo</Text>
          <View style={{ alignItems: 'center', marginVertical: 16 }}>
            {userInfo?.profile_picture_path ? (
              <>
                <Text style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>
                  Debug: {userInfo.profile_picture_path}
                </Text>
                <Image
                  key={`${userInfo.profile_picture_path}-${imageRefreshKey}`}
                  source={{ 
                    uri: `${userInfo.profile_picture_path}?t=${imageRefreshKey}`,
                  }}
                  style={AccountSettingsScreenStyles.profileImage}
                  onError={(error) => {
                    console.error('❌ Image load error:', error.nativeEvent.error);
                    console.error('❌ Failed URI:', userInfo.profile_picture_path);
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully!');
                  }}
                />
              </>
            ) : (
              <View style={AccountSettingsScreenStyles.profileImagePlaceholder}>
                <Text style={AccountSettingsScreenStyles.profileImageInitial}>
                  {userInfo?.name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={buttonStyle}
            onPress={handleChangePhoto}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={buttonTextStyle}>Change Photo</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Username Section */}
        <View style={cardStyle}>
          <Text style={labelStyle}>Username</Text>
          {isEditingUsername ? (
            <>
              <TextInput
                style={inputStyle}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={50}
              />
              <Text style={helperTextStyle}>
                3-50 characters. Letters, numbers, underscores, and hyphens only.
              </Text>
              <TouchableOpacity
                style={buttonStyle}
                onPress={handleSaveUsername}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={buttonTextStyle}>Save Username</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={secondaryButtonStyle}
                onPress={() => {
                  setIsEditingUsername(false);
                  setUsername(userInfo?.username || userInfo?.name || '');
                }}
              >
                <Text style={secondaryButtonTextStyle}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={valueStyle}>{userInfo?.username || userInfo?.name || 'Not set'}</Text>
              <TouchableOpacity
                style={buttonStyle}
                onPress={() => setIsEditingUsername(true)}
              >
                <Text style={buttonTextStyle}>Change Username</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Email Section (Read-only) */}
        <View style={cardStyle}>
          <Text style={labelStyle}>Email</Text>
          <Text style={valueStyle}>{userInfo?.email}</Text>
          <Text style={helperTextStyle}>
            Email cannot be changed (linked to Google account)
          </Text>
        </View>

        {/* Google Account Section (Read-only) */}
        <View style={cardStyle}>
          <Text style={labelStyle}>Connected Account</Text>
          <Text style={valueStyle}>Google</Text>
          <Text style={helperTextStyle}>
            Signed in with Google account
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountSettingsScreen;
