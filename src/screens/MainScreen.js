import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import MainScreenStyles from '../styles/MainScreenStyles';

const MainScreen = ({ onNavigate }) => {
  return (
    <SafeAreaView style={MainScreenStyles.container}>
      <ScrollView style={MainScreenStyles.content}>
        <Text style={MainScreenStyles.title}>Dashboard</Text>
        <Text style={MainScreenStyles.subtitle}>Welcome back!</Text>

        <View style={MainScreenStyles.cardContainer}>
          <TouchableOpacity
            style={MainScreenStyles.card}
            onPress={() => onNavigate('StartMeeting')}
          >
            <Text style={MainScreenStyles.cardTitle}>Start New Meeting</Text>
            <Text style={MainScreenStyles.cardDescription}>
              Begin a new recording session
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={MainScreenStyles.card}
            onPress={() => onNavigate('SessionHistory')}
          >
            <Text style={MainScreenStyles.cardTitle}>Session History</Text>
            <Text style={MainScreenStyles.cardDescription}>
              View your past recordings
            </Text>
          </TouchableOpacity>

          <View style={MainScreenStyles.card}>
            <Text style={MainScreenStyles.cardTitle}>Recent Activity</Text>
            <Text style={MainScreenStyles.cardDescription}>
              No recent sessions
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



export default MainScreen;