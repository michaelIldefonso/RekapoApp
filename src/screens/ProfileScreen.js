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

const ProfileScreen = ({ onLogout }) => {
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

  return (
    <SafeAreaView style={ProfileScreenStyles.container}>
      <ScrollView style={ProfileScreenStyles.content}>
        <Text style={ProfileScreenStyles.title}>Profile</Text>

        <View style={ProfileScreenStyles.profileCard}>
          <View style={ProfileScreenStyles.avatar}>
            <Text style={ProfileScreenStyles.avatarText}>{userInfo.name.charAt(0)}</Text>
          </View>
          <Text style={ProfileScreenStyles.userName}>{userInfo.name}</Text>
          <Text style={ProfileScreenStyles.userEmail}>{userInfo.email}</Text>
          <Text style={ProfileScreenStyles.joinDate}>Member since {userInfo.joinDate}</Text>
        </View>

        <View style={ProfileScreenStyles.statsCard}>
          <Text style={ProfileScreenStyles.statsTitle}>Your Stats</Text>
          <View style={ProfileScreenStyles.statsRow}>
            <View style={ProfileScreenStyles.statItem}>
              <Text style={ProfileScreenStyles.statNumber}>{userInfo.totalSessions}</Text>
              <Text style={ProfileScreenStyles.statLabel}>Total Sessions</Text>
            </View>
            <View style={ProfileScreenStyles.statItem}>
              <Text style={ProfileScreenStyles.statNumber}>45h</Text>
              <Text style={ProfileScreenStyles.statLabel}>Recording Time</Text>
            </View>
            <View style={ProfileScreenStyles.statItem}>
              <Text style={ProfileScreenStyles.statNumber}>124</Text>
              <Text style={ProfileScreenStyles.statLabel}>Action Items</Text>
            </View>
          </View>
        </View>

        <View style={ProfileScreenStyles.optionsContainer}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity key={index} style={ProfileScreenStyles.optionCard}>
              <View>
                <Text style={ProfileScreenStyles.optionTitle}>{option.title}</Text>
                <Text style={ProfileScreenStyles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Text style={ProfileScreenStyles.optionArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={ProfileScreenStyles.logoutButton} onPress={handleLogout}>
          <Text style={ProfileScreenStyles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};



export default ProfileScreen;