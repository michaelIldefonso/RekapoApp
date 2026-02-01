import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  BackHandler,
  TextInput,
  Modal,
} from 'react-native';
import SessionDetailsScreenStyles from '../styles/SessionDetailsScreenStyles';
import { getSessionDetails, updateMeetingSession } from '../services/apiService';
import MessagePopup from '../components/popup/MessagePopup';

const SessionDetailsScreen = ({ route, navigation, isDarkMode }) => {
  const { sessionId } = route.params;
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successPopup, setSuccessPopup] = useState({ visible: false, title: '', message: '' });

  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);
// Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, [navigation]);

  
  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSessionDetails(sessionId);
      
      if (result.success) {
        setSessionData(result.data);
        setNewTitle(result.data.session_title);
      } else {
        setError(result.error);
        Alert.alert('Error', `Failed to load session details: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTitle = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      const result = await updateMeetingSession(sessionId, { session_title: newTitle });
      
      if (result.success || result.status === 200) {
        setSessionData({ ...sessionData, session_title: newTitle });
        setEditingTitle(false);
        setSuccessPopup({
          visible: true,
          title: '✅ Success',
          message: 'Session title updated successfully'
        });
      } else {
        Alert.alert('Error', 'Failed to update session title');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Dynamic styles for dark mode
  const containerStyle = [
    SessionDetailsScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const headerStyle = [
    SessionDetailsScreenStyles.header,
    isDarkMode && { backgroundColor: '#333', borderBottomColor: '#444' },
  ];
  const titleStyle = [
    SessionDetailsScreenStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  const subtitleStyle = [
    SessionDetailsScreenStyles.subtitle,
    isDarkMode && { color: '#bbb' },
  ];
  const sectionTitleStyle = [
    SessionDetailsScreenStyles.sectionTitle,
    isDarkMode && { color: '#fff' },
  ];
  const segmentCardStyle = [
    SessionDetailsScreenStyles.segmentCard,
    isDarkMode && { backgroundColor: '#333', borderColor: '#444' },
  ];
  const segmentNumberStyle = [
    SessionDetailsScreenStyles.segmentNumber,
    isDarkMode && { color: '#007AFF' },
  ];
  const labelStyle = [
    SessionDetailsScreenStyles.label,
    isDarkMode && { color: '#aaa' },
  ];
  const originalTextStyle = [
    SessionDetailsScreenStyles.originalText,
    isDarkMode && { color: '#fff' },
  ];
  const translatedTextStyle = [
    SessionDetailsScreenStyles.translatedText,
    isDarkMode && { color: '#bbb' },
  ];
  const summaryCardStyle = [
    SessionDetailsScreenStyles.summaryCard,
    isDarkMode && { backgroundColor: '#2a4a5a', borderColor: '#3a5a6a' },
  ];
  const summaryTextStyle = [
    SessionDetailsScreenStyles.summaryText,
    isDarkMode && { color: '#fff' },
  ];
  const backButtonStyle = [
    SessionDetailsScreenStyles.backButton,
    isDarkMode && { backgroundColor: '#444' },
  ];
  const backButtonTextStyle = [
    SessionDetailsScreenStyles.backButtonText,
    isDarkMode && { color: '#fff' },
  ];
  const infoRowStyle = [
    SessionDetailsScreenStyles.infoRow,
    isDarkMode && { backgroundColor: '#2a2a2a' },
  ];
  const infoLabelStyle = [
    SessionDetailsScreenStyles.infoLabel,
    isDarkMode && { color: '#aaa' },
  ];
  const infoValueStyle = [
    SessionDetailsScreenStyles.infoValue,
    isDarkMode && { color: '#fff' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={containerStyle}>
        <View style={SessionDetailsScreenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#007AFF'} />
          <Text style={[subtitleStyle, { marginTop: 10 }]}>Loading session details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !sessionData) {
    return (
      <SafeAreaView style={containerStyle}>
        <View style={SessionDetailsScreenStyles.errorContainer}>
          <Text style={[titleStyle, { fontSize: 48, marginBottom: 10 }]}>⚠️</Text>
          <Text style={titleStyle}>Failed to load session</Text>
          <Text style={subtitleStyle}>{error || 'Unknown error'}</Text>
          <TouchableOpacity 
            style={SessionDetailsScreenStyles.retryButton}
            onPress={loadSessionDetails}
          >
            <Text style={SessionDetailsScreenStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      {/* Header */}
      <View style={headerStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => setEditingTitle(true)}>
              <Text style={titleStyle}>{sessionData.session_title}</Text>
              <Text style={[subtitleStyle, { marginTop: 4 }]}>Tap to edit</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[subtitleStyle, { marginTop: 8 }]}>{formatDateTime(sessionData.start_time)}</Text>
      </View>

      <ScrollView style={SessionDetailsScreenStyles.scrollView}>
        {/* Session Info */}
        <View style={SessionDetailsScreenStyles.infoSection}>
          <View style={infoRowStyle}>
            <Text style={infoLabelStyle}>Status:</Text>
            <Text style={[infoValueStyle, { 
              color: sessionData.status === 'completed' ? '#4CAF50' : 
                     sessionData.status === 'recording' ? '#FF9800' : '#F44336'
            }]}>
              {sessionData.status.toUpperCase()}
            </Text>
          </View>
          <View style={infoRowStyle}>
            <Text style={infoLabelStyle}>Total Segments:</Text>
            <Text style={infoValueStyle}>{sessionData.total_segments}</Text>
          </View>
          {sessionData.end_time && (
            <View style={infoRowStyle}>
              <Text style={infoLabelStyle}>Ended:</Text>
              <Text style={infoValueStyle}>{formatDateTime(sessionData.end_time)}</Text>
            </View>
          )}
        </View>

        {/* Summaries Section */}
        {sessionData.summaries && sessionData.summaries.length > 0 && (
          <View style={SessionDetailsScreenStyles.section}>
            <Text style={sectionTitleStyle}>📝 AI Summaries</Text>
            {sessionData.summaries.map((summary, index) => (
              <View key={summary.id} style={summaryCardStyle}>
                <Text style={[labelStyle, { marginBottom: 8 }]}>
                  Summary {index + 1} (Segments {summary.chunk_range_start}-{summary.chunk_range_end})
                </Text>
                <Text style={summaryTextStyle}>{summary.summary_text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Transcripts Section */}
        <View style={SessionDetailsScreenStyles.section}>
          <Text style={sectionTitleStyle}>🎙️ Full Transcript</Text>
          {sessionData.recording_segments && sessionData.recording_segments.length > 0 ? (
            sessionData.recording_segments.map((segment) => (
              <View key={segment.id} style={segmentCardStyle}>
                <View style={SessionDetailsScreenStyles.textBlock}>
                  <Text style={labelStyle}>English:</Text>
                  <Text style={translatedTextStyle}>{segment.english_translation}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={segmentCardStyle}>
              <Text style={subtitleStyle}>No transcript segments available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Title Modal */}
      <Modal
        visible={editingTitle}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingTitle(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: isDarkMode ? '#333' : '#fff',
            borderRadius: 12,
            padding: 20,
            width: '85%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
            <Text style={[titleStyle, { marginBottom: 15 }]}>Edit Session Title</Text>
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: isDarkMode ? '#555' : '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 15,
                fontSize: 16,
                color: isDarkMode ? '#fff' : '#000',
                backgroundColor: isDarkMode ? '#444' : '#f9f9f9',
              }}
              placeholder="Enter new title"
              placeholderTextColor={isDarkMode ? '#999' : '#999'}
              value={newTitle}
              onChangeText={setNewTitle}
              editable={!isSaving}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#ccc',
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setEditingTitle(false)}
                disabled={isSaving}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#007AFF',
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={handleEditTitle}
                disabled={isSaving}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Popup */}
      <MessagePopup
        visible={successPopup.visible}
        title={successPopup.title}
        message={successPopup.message}
        onClose={() => setSuccessPopup({ visible: false, title: '', message: '' })}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};

export default SessionDetailsScreen;
