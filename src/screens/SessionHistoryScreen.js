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

const SessionHistoryScreen = ({ navigation, isDarkMode, onToggleDarkMode }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [messagePopup, setMessagePopup] = useState({ visible: false, title: '', message: '' });

  // Fetch sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load session history from API
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSessionHistory(0, 50);
      
      if (result.success) {
        // Filter out sessions still in "recording" status to avoid duplicates
        const filteredSessions = result.data.filter(s => s.status !== 'recording');
        setSessions(filteredSessions);
      } else {
        setError(result.error);
        Alert.alert('Error', `Failed to load sessions: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', 'Failed to load session history');
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

  // Handle session click - navigate to details screen
  const handleSessionPress = (sessionId) => {
    navigation.navigate('SessionDetails', { sessionId });
  };

  // Handle session deletion with confirmation
  const handleDeleteSession = (sessionId, sessionTitle) => {
    setSessionToDelete({ id: sessionId, title: sessionTitle });
    setDeletePopupVisible(true);
  };

  // Confirm deletion
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
        setMessagePopup({ 
          visible: true, 
          title: 'Success', 
          message: 'Session deleted successfully' 
        });
      } else {
        setDeletePopupVisible(false);
        setSessionToDelete(null);
        setMessagePopup({ 
          visible: true, 
          title: 'Error', 
          message: `Failed to delete session: ${result.error}` 
        });
      }
    } catch (err) {
      setDeletePopupVisible(false);
      setSessionToDelete(null);
      setMessagePopup({ 
        visible: true, 
        title: 'Error', 
        message: 'Failed to delete session' 
      });
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setDeletePopupVisible(false);
    setSessionToDelete(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate duration between start and end time
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