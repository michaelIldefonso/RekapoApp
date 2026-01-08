import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import ProfileScreenStyles from '../styles/ProfileScreenStyles';
import ThemeToggleButton from '../components/ThemeToggleButton';
import LogoutPopup from '../components/popup/LogoutPopup';
import { getStoredUser, signOut } from '../services/authService';

const ProfileScreen = ({ onLogout, isDarkMode, onToggleDarkMode, onNavigate }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Load user data from storage
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getStoredUser();
      if (user) {
        setUserInfo(user);
        console.log('📱 Loaded user data:', user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutPopup(true);
  };

  const confirmLogout = async () => {
    setShowLogoutPopup(false);
    await signOut();
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutPopup(false);
  };

  const handleOptionPress = (title) => {
    switch (title) {
      case 'Account Settings':
        onNavigate('AccountSettings');
        break;
      case 'Privacy Settings':
        onNavigate('PrivacySettings');
        break;
      case 'About':
        onNavigate('About');
        break;
      default:
        break;
    }
  };

  const profileOptions = [
    { title: 'Account Settings', subtitle: 'Manage your account preferences' },
    { title: 'Privacy Settings', subtitle: 'Control your privacy preferences' },
    { title: 'About', subtitle: 'App version and information' },
  ];

  // Dynamic styles for dark mode
  const containerStyle = [
    ProfileScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const titleStyle = [
    ProfileScreenStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  const profileCardStyle = [
    ProfileScreenStyles.profileCard,
    isDarkMode && { backgroundColor: '#333', borderColor: '#444444', shadowOpacity: 0, elevation: 0 },
  ];
  const userNameStyle = [
    ProfileScreenStyles.userName,
    isDarkMode && { color: '#fff' },
  ];
  const userEmailStyle = [
    ProfileScreenStyles.userEmail,
    isDarkMode && { color: '#bbb' },
  ];
  const joinDateStyle = [
    ProfileScreenStyles.joinDate,
    isDarkMode && { color: '#999' },
  ];
  const optionCardStyle = [
    ProfileScreenStyles.optionCard,
    isDarkMode && { backgroundColor: '#333', borderColor: '#444444', shadowOpacity: 0, elevation: 0 },
  ];
  const optionTitleStyle = [
    ProfileScreenStyles.optionTitle,
    isDarkMode && { color: '#fff' },
  ];
  const optionSubtitleStyle = [
    ProfileScreenStyles.optionSubtitle,
    isDarkMode && { color: '#bbb' },
  ];
  const optionArrowStyle = [
    ProfileScreenStyles.optionArrow,
    isDarkMode && { color: '#bbb' },
  ];
  const logoutButtonStyle = [
    ProfileScreenStyles.logoutButton,
    isDarkMode && { backgroundColor: '#8B0000' },
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={ProfileScreenStyles.content}>
        <View style={ProfileScreenStyles.headerRow}>
          <Text style={[titleStyle, { marginBottom: 0, marginTop: 0, lineHeight: 28 }]}>Profile</Text>
          <View style={ProfileScreenStyles.themeToggleButtonWrapper}>
            <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
        ) : userInfo ? (
          <>
            <View style={profileCardStyle}>
              {/* Profile Picture from Google */}
              {userInfo.profile_picture_path ? (
                <Image 
                  source={{ uri: userInfo.profile_picture_path }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    marginBottom: 12,
                  }}
                />
              ) : (
                <View style={ProfileScreenStyles.avatar}>
                  <Text style={ProfileScreenStyles.avatarText}>
                    {userInfo.name?.charAt(0) || userInfo.email?.charAt(0) || '?'}
                  </Text>
                </View>
              )}
              <Text style={userNameStyle}>{userInfo.username || userInfo.name || 'No username'}</Text>
              <Text style={userEmailStyle}>{userInfo.email}</Text>
              <Text style={joinDateStyle}>
                Member since {new Date(userInfo.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 50, color: isDarkMode ? '#fff' : '#000' }}>
            No user data found
          </Text>
        )}

        <View style={ProfileScreenStyles.optionsContainer}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={optionCardStyle}
              onPress={() => handleOptionPress(option.title)}
            >
              <View>
                <Text style={optionTitleStyle}>{option.title}</Text>
                <Text style={optionSubtitleStyle}>{option.subtitle}</Text>
              </View>
              <Text style={optionArrowStyle}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={logoutButtonStyle} onPress={handleLogout}>
          <Text style={ProfileScreenStyles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <LogoutPopup
        visible={showLogoutPopup}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};



export default ProfileScreen;