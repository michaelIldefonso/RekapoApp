import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

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
    <TouchableOpacity style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTitle}>{item.title}</Text>
        <Text style={styles.sessionDate}>{item.date}</Text>
      </View>
      <View style={styles.sessionDetails}>
        <Text style={styles.sessionInfo}>Duration: {item.duration}</Text>
        <Text style={styles.sessionInfo}>Participants: {item.participants}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Session History</Text>
        <Text style={styles.subtitle}>Your recorded sessions</Text>

        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  list: {
    flex: 1,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default SessionHistoryScreen;