import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import ProfileScreenStyles from '../styles/ProfileScreenStyles';
import ThemeToggleButton from '../components/ThemeToggleButton';

const ProfileScreen = ({ onLogout, isDarkMode, onToggleDarkMode }) => {
  const [userInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'October 2023',
    totalSessions: 15,
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const profileOptions = [
    { title: 'Account Settings', subtitle: 'Manage your account preferences' },
    { title: 'Notification Settings', subtitle: 'Configure app notifications' },
    { title: 'Storage & Data', subtitle: 'Manage your recordings and data' },
    { title: 'Privacy Settings', subtitle: 'Control your privacy preferences' },
    { title: 'Help & Support', subtitle: 'Get help and contact support' },
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
    isDarkMode && { backgroundColor: '#333', shadowOpacity: 0, elevation: 0 },
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
  const statsCardStyle = [
    ProfileScreenStyles.statsCard,
    isDarkMode && { backgroundColor: '#333', shadowOpacity: 0, elevation: 0 },
  ];
  const statsTitleStyle = [
    ProfileScreenStyles.statsTitle,
    isDarkMode && { color: '#fff' },
  ];
  const statNumberStyle = [
    ProfileScreenStyles.statNumber,
    isDarkMode && { color: '#fff' },
  ];
  const statLabelStyle = [
    ProfileScreenStyles.statLabel,
    isDarkMode && { color: '#bbb' },
  ];
  const optionCardStyle = [
    ProfileScreenStyles.optionCard,
    isDarkMode && { backgroundColor: '#333', shadowOpacity: 0, elevation: 0 },
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

        <View style={profileCardStyle}>
          <View style={ProfileScreenStyles.avatar}>
            <Text style={ProfileScreenStyles.avatarText}>{userInfo.name.charAt(0)}</Text>
          </View>
          <Text style={userNameStyle}>{userInfo.name}</Text>
          <Text style={userEmailStyle}>{userInfo.email}</Text>
          <Text style={joinDateStyle}>Member since {userInfo.joinDate}</Text>
        </View>

        <View style={statsCardStyle}>
          <Text style={statsTitleStyle}>Your Stats</Text>
          <View style={ProfileScreenStyles.statsRow}>
            <View style={ProfileScreenStyles.statItem}>
              <Text style={statNumberStyle}>{userInfo.totalSessions}</Text>
              <Text style={statLabelStyle}>Total Sessions</Text>
            </View>
            <View style={ProfileScreenStyles.statItem}>
              <Text style={statNumberStyle}>45h</Text>
              <Text style={statLabelStyle}>Recording Time</Text>
            </View>
            <View style={ProfileScreenStyles.statItem}>
              <Text style={statNumberStyle}>124</Text>
              <Text style={statLabelStyle}>Action Items</Text>
            </View>
          </View>
        </View>

        <View style={ProfileScreenStyles.optionsContainer}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity key={index} style={optionCardStyle}>
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
    </SafeAreaView>
  );
};



export default ProfileScreen;