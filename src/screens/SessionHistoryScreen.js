import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import SessionHistoryScreenStyles from '../styles/SessionHistoryScreenStyles';
import ThemeToggleButton from '../components/ThemeToggleButton';

const SessionHistoryScreen = ({ isDarkMode, onToggleDarkMode }) => {
  // Sample data - replace with actual data from your backend
  const sessions = [
    {
      id: '1',
      title: 'Team Meeting #1',
      date: '2023-10-25',
      duration: '45 min',
      participants: 5,
    },
    {
      id: '2',
      title: 'Project Review',
      date: '2023-10-22',
      duration: '30 min',
      participants: 3,
    },
    {
      id: '3',
      title: 'Client Call',
      date: '2023-10-20',
      duration: '60 min',
      participants: 2,
    },
  ];

  // Dynamic styles for dark mode
  const containerStyle = [
    SessionHistoryScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const titleStyle = [
    SessionHistoryScreenStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  const subtitleStyle = [
    SessionHistoryScreenStyles.subtitle,
    isDarkMode && { color: '#bbb' },
  ];
  const sessionCardStyle = [
    SessionHistoryScreenStyles.sessionCard,
    isDarkMode && { backgroundColor: '#333', shadowOpacity: 0, elevation: 0 },
  ];
  const sessionTitleStyle = [
    SessionHistoryScreenStyles.sessionTitle,
    isDarkMode && { color: '#fff' },
  ];
  const sessionDateStyle = [
    SessionHistoryScreenStyles.sessionDate,
    isDarkMode && { color: '#bbb' },
  ];
  const sessionInfoStyle = [
    SessionHistoryScreenStyles.sessionInfo,
    isDarkMode && { color: '#bbb' },
  ];

  const renderSessionItem = ({ item }) => (
    <TouchableOpacity style={sessionCardStyle}>
      <View style={SessionHistoryScreenStyles.sessionHeader}>
        <Text style={sessionTitleStyle}>{item.title}</Text>
        <Text style={sessionDateStyle}>{item.date}</Text>
      </View>
      <View style={SessionHistoryScreenStyles.sessionDetails}>
        <Text style={sessionInfoStyle}>Duration: {item.duration}</Text>
        <Text style={sessionInfoStyle}>Participants: {item.participants}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={containerStyle}>
      <View style={SessionHistoryScreenStyles.content}>
        <View style={SessionHistoryScreenStyles.headerRow}>
          <Text style={titleStyle}>Session History</Text>
          <View style={SessionHistoryScreenStyles.themeToggleButtonWrapper}>
            <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          </View>
        </View>
        <Text style={subtitleStyle}>Your recorded sessions</Text>

        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id}
          style={SessionHistoryScreenStyles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default SessionHistoryScreen;