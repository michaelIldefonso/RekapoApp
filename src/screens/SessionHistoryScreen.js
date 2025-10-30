import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import SessionHistoryScreenStyles from '../styles/SessionHistoryScreenStyles';

const SessionHistoryScreen = () => {
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

  const renderSessionItem = ({ item }) => (
    <TouchableOpacity style={SessionHistoryScreenStyles.sessionCard}>
      <View style={SessionHistoryScreenStyles.sessionHeader}>
        <Text style={SessionHistoryScreenStyles.sessionTitle}>{item.title}</Text>
        <Text style={SessionHistoryScreenStyles.sessionDate}>{item.date}</Text>
      </View>
      <View style={SessionHistoryScreenStyles.sessionDetails}>
        <Text style={SessionHistoryScreenStyles.sessionInfo}>Duration: {item.duration}</Text>
        <Text style={SessionHistoryScreenStyles.sessionInfo}>Participants: {item.participants}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={SessionHistoryScreenStyles.container}>
      <View style={SessionHistoryScreenStyles.content}>
        <Text style={SessionHistoryScreenStyles.title}>Session History</Text>
        <Text style={SessionHistoryScreenStyles.subtitle}>Your recorded sessions</Text>

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