/**
 * SessionHistoryScreen.js — List of Past Recording Sessions
 *
 * Fetches and displays all the user’s recorded meeting sessions from the backend.
 * Features:
 *   - Pull-to-refresh to reload sessions
 *   - Tap a session card to view full details (SessionDetailsScreen)
 *   - Swipe/tap trash icon to delete a session (with confirmation popup)
 *   - Shows loading spinner, empty state, and error states
 *   - Formats date and calculates duration for display
 *
 * Data is fetched from: GET /api/sessions (paginated, default 50)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SessionHistoryScreenStyles from '../styles/SessionHistoryScreenStyles';
import DeleteSessionPopup from '../components/popup/DeleteSessionPopup';
import MessagePopup from '../components/popup/MessagePopup';
import { getSessionHistory, deleteMeetingSession } from '../services/apiService';
import logger from '../utils/logger';

const SessionHistoryScreen = ({ navigation, isDarkMode, onToggleDarkMode }) => {
  const [sessions, setSessions] = useState([]);                 // Array of session objects from the API
  const [loading, setLoading] = useState(true);                 // Shows spinner on initial load
  const [refreshing, setRefreshing] = useState(false);          // Pull-to-refresh indicator
  const [error, setError] = useState(null);                     // Error message if API call fails
  const [deletePopupVisible, setDeletePopupVisible] = useState(false); // Controls delete confirmation popup
  const [sessionToDelete, setSessionToDelete] = useState(null); // Stores session being deleted
  const [messagePopup, setMessagePopup] = useState({ visible: false, title: '', message: '' }); // General popup

  // Helper to show a popup message and optionally log errors
  const showPopup = (title, message, level = 'info') => {
    setMessagePopup({ visible: true, title, message });
    if (level === 'error') {
      logger.error('UI error popup shown', { screen: 'SessionHistory', title, message });
    }
  };

  const showErrorAlert = (title, message) => {
    logger.error('UI error alert shown', { screen: 'SessionHistory', title, message });
    Alert.alert(title, message);
  };

  // Fetch sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load session history from backend API (GET /api/sessions)
  // Called on mount and on pull-to-refresh
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSessionHistory(0, 50);
      
      if (result.success) {
        setSessions(result.data);
      } else {
        setError(result.error);
        showErrorAlert('Error', `Failed to load sessions: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      showErrorAlert('Error', 'Failed to load session history');
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  // Navigate to session details when user taps a session card
  const handleSessionPress = (sessionId) => {
    navigation.navigate('SessionDetails', { sessionId });
  };

  // Show delete confirmation popup before actually deleting
  const handleDeleteSession = (sessionId, sessionTitle) => {
    setSessionToDelete({ id: sessionId, title: sessionTitle });
    setDeletePopupVisible(true);
  };

  // Confirm and execute deletion via API (DELETE /api/sessions/:id)
  // On success, removes the session from local state without re-fetching
  const confirmDelete = async () => {
    if (!sessionToDelete) return;

    try {
      const result = await deleteMeetingSession(sessionToDelete.id);
      
      if (result.success) {
        // Remove the session from local state
        setSessions(prevSessions => 
          prevSessions.filter(session => session.id !== sessionToDelete.id)
        );
        setDeletePopupVisible(false);
        setSessionToDelete(null);
        showPopup('Success', 'Session deleted successfully');
      } else {
        setDeletePopupVisible(false);
        setSessionToDelete(null);
        showPopup('Error', `Failed to delete session: ${result.error}`, 'error');
      }
    } catch (err) {
      setDeletePopupVisible(false);
      setSessionToDelete(null);
      showPopup('Error', 'Failed to delete session', 'error');
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setDeletePopupVisible(false);
    setSessionToDelete(null);
  };

  // Format ISO date string to readable format (e.g., "Mar 9, 2026")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate and format the session duration from start/end timestamps
  const formatDuration = (startTime, endTime) => {
    if (!endTime) return 'In progress';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const durationMin = Math.floor(durationMs / 60000);
    
    if (durationMin < 60) {
      return `${durationMin} min`;
    } else {
      const hours = Math.floor(durationMin / 60);
      const minutes = durationMin % 60;
      return `${hours}h ${minutes}min`;
    }
  };

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
    isDarkMode && { backgroundColor: '#333333', borderColor: '#444444', borderWidth: 1, shadowOpacity: 0.2 },
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
  const deleteButtonStyle = [
    SessionHistoryScreenStyles.deleteButton,
    isDarkMode && { backgroundColor: '#333333' },
  ];

  // Renders a single session card with title, date, duration, status, and delete button
  const renderSessionItem = ({ item }) => (
    <View style={sessionCardStyle}>
      <TouchableOpacity 
        style={SessionHistoryScreenStyles.sessionContent}
        onPress={() => handleSessionPress(item.id)}
      >
        <View style={SessionHistoryScreenStyles.sessionHeader}>
          <Text style={sessionTitleStyle}>{item.session_title}</Text>
          <Text style={sessionDateStyle}>{formatDate(item.start_time)}</Text>
        </View>
        <View style={SessionHistoryScreenStyles.sessionDetails}>
          <Text style={sessionInfoStyle}>Duration: {formatDuration(item.start_time, item.end_time)}</Text>
          <Text style={sessionInfoStyle}>Status: {item.status}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={deleteButtonStyle}
        onPress={() => handleDeleteSession(item.id, item.session_title)}
      >
        <Ionicons name="trash" size={24} color={isDarkMode ? "#cc3333" : "#ff4444"} />
      </TouchableOpacity>
    </View>
  );

  // Show loading spinner
  if (loading) {
    return (
      <SafeAreaView style={containerStyle}>
        <View style={SessionHistoryScreenStyles.content}>
          <Text style={titleStyle}>Session History</Text>
          <View style={SessionHistoryScreenStyles.loadingContainer}>
            <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#007AFF'} />
            <Text style={[subtitleStyle, { marginTop: 10 }]}>Loading sessions...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state
  if (!loading && sessions.length === 0) {
    return (
      <SafeAreaView style={containerStyle}>
        <View style={SessionHistoryScreenStyles.content}>
          <Text style={titleStyle}>Session History</Text>
          <View style={SessionHistoryScreenStyles.emptyContainer}>
            <Text style={[titleStyle, { fontSize: 48, marginBottom: 10 }]}>📝</Text>
            <Text style={titleStyle}>No sessions yet</Text>
            <Text style={subtitleStyle}>Your recorded sessions will appear here</Text>
            <TouchableOpacity 
              style={SessionHistoryScreenStyles.refreshButton}
              onPress={loadSessions}
            >
              <Text style={SessionHistoryScreenStyles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <View style={SessionHistoryScreenStyles.content}>
        <Text style={titleStyle}>Session History</Text>
        <Text style={subtitleStyle}>Your recorded sessions</Text>

        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id.toString()}
          style={SessionHistoryScreenStyles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDarkMode ? '#fff' : '#007AFF'}
            />
          }
        />
      </View>

      <DeleteSessionPopup
        visible={deletePopupVisible}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDarkMode={isDarkMode}
        sessionTitle={sessionToDelete?.title || ''}
      />
      <MessagePopup
        visible={messagePopup.visible}
        title={messagePopup.title}
        message={messagePopup.message}
        onClose={() => setMessagePopup({ visible: false, title: '', message: '' })}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};

export default SessionHistoryScreen;