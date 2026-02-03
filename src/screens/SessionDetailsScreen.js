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
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [flippedSegments, setFlippedSegments] = useState({});
  const [segmentRatings, setSegmentRatings] = useState({});

  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);
// Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('SessionHistory');
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

  const formatTimeOnly = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const calculateDuration = (startTime, endTime) => {
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

  const toggleSegmentFlip = (segmentId) => {
    setFlippedSegments(prev => ({
      ...prev,
      [segmentId]: !prev[segmentId]
    }));
  };

  const handleSegmentRating = (segmentId, rating) => {
    setSegmentRatings(prev => ({
      ...prev,
      [segmentId]: prev[segmentId] === rating ? 0 : rating
    }));
  };

  const renderStars = (segmentId) => {
    const rating = segmentRatings[segmentId] || 0;
    return (
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleSegmentRating(segmentId, star)}
          >
            <Text style={{ fontSize: 24 }}>
              {star <= rating ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
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
    isDarkMode && { backgroundColor: 'transparent', borderColor: '#007AFF' },
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
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => setEditingTitle(true)}>
              <Text style={titleStyle}>{sessionData.session_title}</Text>
              <Text style={[subtitleStyle, { marginTop: 4 }]}>Tap to edit</Text>
            </TouchableOpacity>
            
            {/* Time Range and Duration */}
            <View style={{ marginTop: 12 }}>
              <Text style={[subtitleStyle, { marginBottom: 4 }]}>
                {formatDateOnly(sessionData.start_time)} • {formatTimeOnly(sessionData.start_time)}
              </Text>
              <Text style={[labelStyle, { marginTop: 6 }]}>
                ⏱️ Duration: {calculateDuration(sessionData.start_time, sessionData.end_time)}
              </Text>
            </View>
          </View>
          
          {/* Status and Segments on Right Side */}
          <View style={{ marginLeft: 16 }}>
            <View style={{ marginBottom: 12 }}>
              <Text style={[labelStyle, { fontSize: 12 }]}>Status</Text>
              <Text style={[infoValueStyle, { 
                color: sessionData.status === 'completed' ? '#4CAF50' : 
                       sessionData.status === 'recording' ? '#FF9800' : '#F44336',
                fontSize: 14,
                fontWeight: '600',
                marginTop: 2
              }]}>
                {sessionData.status.toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={[labelStyle, { fontSize: 12 }]}>Segments</Text>
              <Text style={[infoValueStyle, { fontSize: 14, fontWeight: '600', marginTop: 2 }]}>
                {sessionData.total_segments}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={SessionDetailsScreenStyles.scrollView}>
        {/* Overall Session Summary Card - Expandable */}
        <TouchableOpacity 
          onPress={() => setExpandedSummary(!expandedSummary)}
          activeOpacity={0.7}
        >
          <View style={[summaryCardStyle, { 
            backgroundColor: 'transparent',
            borderLeftWidth: 0,
            padding: 15,
            marginBottom: 16,
          }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[sectionTitleStyle, { marginBottom: 0 }]}>📋 Session Summary</Text>
              <Text style={{ fontSize: 20, color: isDarkMode ? '#bbb' : '#7f8c8d' }}>
                {expandedSummary ? '▼' : '▶'}
              </Text>
            </View>
            
            {expandedSummary && (
              <View style={{ marginTop: 12 }}>
                {sessionData.summaries && sessionData.summaries.length > 0 ? (
                  <Text style={[summaryTextStyle, { color: isDarkMode ? '#bbb' : '#5a6c7d' }]}>
                    {sessionData.summaries.map(s => s.summary_text).join('\n\n')}
                  </Text>
                ) : (
                  <Text style={[summaryTextStyle, { color: isDarkMode ? '#999' : '#999', fontStyle: 'italic' }]}>
                    No summary available for this session yet.
                  </Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>

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
              <TouchableOpacity 
                key={segment.id}
                onPress={() => toggleSegmentFlip(segment.id)}
                activeOpacity={0.7}
              >
                <View style={[segmentCardStyle]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <Text style={labelStyle}>
                      {flippedSegments[segment.id] ? 'Original Transcription' : 'English Translation'}
                    </Text>
                    <Text style={{ fontSize: 16, color: isDarkMode ? '#bbb' : '#7f8c8d' }}>
                      {flippedSegments[segment.id] ? '🔄' : '🔄'}
                    </Text>
                  </View>
                  <View style={SessionDetailsScreenStyles.textBlock}>
                    <Text style={flippedSegments[segment.id] ? [originalTextStyle] : [translatedTextStyle]}>
                      {flippedSegments[segment.id] 
                        ? (segment.original_text || segment.original_transcription || 'Original text not available')
                        : segment.english_translation
                      }
                    </Text>
                  </View>
                  {flippedSegments[segment.id] && renderStars(segment.id)}
                </View>
              </TouchableOpacity>
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
