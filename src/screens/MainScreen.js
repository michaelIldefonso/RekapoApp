import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const MainScreen = ({ onNavigate }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => onNavigate('StartMeeting')}
          >
            <Text style={styles.cardTitle}>Start New Meeting</Text>
            <Text style={styles.cardDescription}>
              Begin a new recording session
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => onNavigate('SessionHistory')}
          >
            <Text style={styles.cardTitle}>Session History</Text>
            <Text style={styles.cardDescription}>
              View your past recordings
            </Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            <Text style={styles.cardDescription}>
              No recent sessions
            </Text>
          </View>
        </View>
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
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  cardContainer: {
    gap: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default MainScreen;