import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import SessionDetailsScreenStyles from '../styles/SessionDetailsScreenStyles';
import { getSessionDetails } from '../services/apiService';

const SessionDetailsScreen = ({ route, navigation, isDarkMode }) => {
  const { sessionId } = route.params;
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);

  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSessionDetails(sessionId);
      
      if (result.success) {
        setSessionData(result.data);
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
          <TouchableOpacity 
            style={[backButtonStyle, { marginTop: 10 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={backButtonTextStyle}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      {/* Header */}
      <View style={headerStyle}>
        <TouchableOpacity 
          style={backButtonStyle}
          onPress={() => navigation.goBack()}
        >
          <Text style={backButtonTextStyle}>← Back</Text>
        </TouchableOpacity>
        <Text style={titleStyle}>{sessionData.session_title}</Text>
        <Text style={subtitleStyle}>{formatDateTime(sessionData.start_time)}</Text>
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
                <Text style={segmentNumberStyle}>Segment {segment.segment_number}</Text>
                
                <View style={SessionDetailsScreenStyles.textBlock}>
                  <Text style={labelStyle}>Original:</Text>
                  <Text style={originalTextStyle}>{segment.transcript_text}</Text>
                </View>

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
    </SafeAreaView>
  );
};

export default SessionDetailsScreen;
