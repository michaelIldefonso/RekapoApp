import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInfo.name.charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{userInfo.name}</Text>
          <Text style={styles.userEmail}>{userInfo.email}</Text>
          <Text style={styles.joinDate}>Member since {userInfo.joinDate}</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userInfo.totalSessions}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>45h</Text>
              <Text style={styles.statLabel}>Recording Time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>124</Text>
              <Text style={styles.statLabel}>Action Items</Text>
            </View>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.optionCard}>
              <View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
    marginTop: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 14,
    color: '#95a5a6',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  optionArrow: {
    fontSize: 24,
    color: '#bdc3c7',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;