/**
 * SessionDetailsScreen.js — View Full Session Details
 *
 * Displays complete information about a recorded meeting session:
 *   - Session title (editable via modal)
 *   - Date, time, duration, status, segment count
 *   - Final AI-generated summary of the entire session
 *   - Expandable list of chunk-based AI summaries (generated every ~10 segments)
 *   - Full transcript with English translation (tap to flip between original and translation)
 *   - Star rating system for individual transcript segments (feedback for AI quality)
 *   - Export to TXT or PDF (uses expo-sharing and expo-print)
 *
 * Data is fetched from: GET /api/sessions/:id/details
 */
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
import { getSessionDetails, updateMeetingSession, rateSegment } from '../services/apiService';
import MessagePopup from '../components/popup/MessagePopup';
import logger from '../utils/logger';
import * as FileSystem from 'expo-file-system';   // For writing export files to device cache
import * as Sharing from 'expo-sharing';           // For opening the OS share sheet
import * as Print from 'expo-print';               // For generating PDF from HTML

const SessionDetailsScreen = ({ route, navigation, isDarkMode }) => {
  const { sessionId } = route.params; // Session ID passed from SessionHistoryScreen

  // ── State ─────────────────────────────────────────────────────────────
  const [sessionData, setSessionData] = useState(null);        // Full session object from API
  const [loading, setLoading] = useState(true);                // Loading spinner
  const [error, setError] = useState(null);                    // Error message
  const [editingTitle, setEditingTitle] = useState(false);     // Controls title edit modal
  const [newTitle, setNewTitle] = useState('');                 // Text input for new title
  const [isSaving, setIsSaving] = useState(false);             // Saving state for title update
  const [successPopup, setSuccessPopup] = useState({ visible: false, title: '', message: '' });
  const [expandedSummary, setExpandedSummary] = useState(false);       // Toggle for summary section
  const [expandedAISummaries, setExpandedAISummaries] = useState(false); // Toggle for AI summaries accordion
  const [flippedSegments, setFlippedSegments] = useState({});  // Tracks which segments show original vs translation
  const [segmentRatings, setSegmentRatings] = useState({});    // Maps segment ID → star rating (1-5)

  const showErrorAlert = (title, message) => {
    logger.error('UI error alert shown', { screen: 'SessionDetails', title, message, sessionId });
    Alert.alert(title, message);
  };

  // Fetch session details when sessionId changes
  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);

  // Handle Android hardware back button — go back to session history instead of default
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('SessionHistory');
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, [navigation]);

  // Fetch complete session details from backend (segments, summaries, etc.)
  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSessionDetails(sessionId);
      
      if (result.success) {
        setSessionData(result.data);
        setNewTitle(result.data.session_title);
        
        // Initialize segment ratings from API data
        if (result.data.recording_segments && result.data.recording_segments.length > 0) {
          const ratingsMap = {};
          result.data.recording_segments.forEach(segment => {
            if (segment.rating) {
              ratingsMap[segment.id] = segment.rating;
            }
          });
          setSegmentRatings(ratingsMap);
          
          // Debug: Log first segment structure to see available fields
          console.log('📝 First segment fields:', Object.keys(result.data.recording_segments[0]));
          console.log('📝 First segment data:', result.data.recording_segments[0]);
        }
      } else {
        setError(result.error);
        showErrorAlert('Error', `Failed to load session details: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      showErrorAlert('Error', 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  // Save edited session title to backend via PATCH /api/sessions/:id
  const handleEditTitle = async () => {
    if (!newTitle.trim()) {
      showErrorAlert('Error', 'Title cannot be empty');
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
        showErrorAlert('Error', 'Failed to update session title');
      }
    } catch (err) {
      showErrorAlert('Error', err.message);
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

  // Toggle a transcript segment between showing English translation and original text
  const toggleSegmentFlip = (segmentId) => {
    setFlippedSegments(prev => ({
      ...prev,
      [segmentId]: !prev[segmentId]
    }));
  };

  // Handle star rating for a transcript segment — sends rating to backend
  // Uses optimistic UI update: updates the rating immediately, reverts on API failure
  const handleSegmentRating = async (segmentId, rating) => {
    const currentRating = segmentRatings[segmentId];
    const newRating = currentRating === rating ? 0 : rating;
    
    // Only send API request if rating is being set (not cleared)
    if (newRating > 0) {
      try {
        // Optimistically update UI
        setSegmentRatings(prev => ({
          ...prev,
          [segmentId]: newRating
        }));
        
        // Call API to save rating
        const result = await rateSegment(sessionId, segmentId, newRating);
        
        if (result.success) {
          console.log(`✅ Rated segment ${segmentId} with ${newRating} stars`);
        } else {
          // Revert on failure
          setSegmentRatings(prev => ({
            ...prev,
            [segmentId]: currentRating
          }));
          showErrorAlert('Error', 'Failed to save rating');
        }
      } catch (error) {
        // Revert on error
        setSegmentRatings(prev => ({
          ...prev,
          [segmentId]: currentRating
        }));
        showErrorAlert('Error', `Failed to save rating: ${error.message}`);
      }
    } else {
      // Just clear locally (no API call for clearing)
      setSegmentRatings(prev => ({
        ...prev,
        [segmentId]: 0
      }));
    }
  };

  // Renders either a "Rated" badge or interactive stars for a segment
  const renderRatingOrBadge = (segmentId) => {
    const rating = segmentRatings[segmentId] || 0;
    
    // If already rated, show badge
    if (rating > 0) {
      return (
        <View style={SessionDetailsScreenStyles.segmentRatingContainer}>
          <Text style={{ fontSize: 14, color: '#FFD700', fontWeight: 'bold' }}>
            Rated ⭐
          </Text>
        </View>
      );
    }
    
    // If not rated, show interactive stars
    return (
      <View style={SessionDetailsScreenStyles.segmentRatingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleSegmentRating(segmentId, star)}
          >
            <Text style={{ fontSize: 24 }}>☆</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Dynamic styles for dark mode
  const containerStyle = isDarkMode 
    ? [SessionDetailsScreenStyles.container, SessionDetailsScreenStyles.containerDark]
    : SessionDetailsScreenStyles.container;
  
  const headerStyle = isDarkMode
    ? [SessionDetailsScreenStyles.header, SessionDetailsScreenStyles.headerDark]
    : SessionDetailsScreenStyles.header;
  
  const titleStyle = isDarkMode
    ? [SessionDetailsScreenStyles.title, SessionDetailsScreenStyles.titleDark]
    : SessionDetailsScreenStyles.title;
  
  const subtitleStyle = isDarkMode
    ? [SessionDetailsScreenStyles.subtitle, SessionDetailsScreenStyles.subtitleDark]
    : SessionDetailsScreenStyles.subtitle;
  
  const sectionTitleStyle = isDarkMode
    ? [SessionDetailsScreenStyles.sectionTitle, SessionDetailsScreenStyles.sectionTitleDark]
    : SessionDetailsScreenStyles.sectionTitle;
  
  const segmentCardStyle = isDarkMode
    ? [SessionDetailsScreenStyles.segmentCard, SessionDetailsScreenStyles.segmentCardDark]
    : SessionDetailsScreenStyles.segmentCard;
  
  const segmentNumberStyle = isDarkMode
    ? [SessionDetailsScreenStyles.segmentNumber, SessionDetailsScreenStyles.segmentNumberDark]
    : SessionDetailsScreenStyles.segmentNumber;
  
  const labelStyle = isDarkMode
    ? [SessionDetailsScreenStyles.label, SessionDetailsScreenStyles.labelDark]
    : SessionDetailsScreenStyles.label;
  
  const originalTextStyle = isDarkMode
    ? [SessionDetailsScreenStyles.originalText, SessionDetailsScreenStyles.originalTextDark]
    : SessionDetailsScreenStyles.originalText;
  
  const translatedTextStyle = isDarkMode
    ? [SessionDetailsScreenStyles.translatedText, SessionDetailsScreenStyles.translatedTextDark]
    : SessionDetailsScreenStyles.translatedText;
  
  const summaryCardStyle = isDarkMode
    ? [SessionDetailsScreenStyles.summaryCard, SessionDetailsScreenStyles.summaryCardDark]
    : SessionDetailsScreenStyles.summaryCard;
  
  const summaryTextStyle = isDarkMode
    ? [SessionDetailsScreenStyles.summaryText, SessionDetailsScreenStyles.summaryTextDark]
    : SessionDetailsScreenStyles.summaryText;
  
  const backButtonStyle = isDarkMode
    ? [SessionDetailsScreenStyles.backButton, SessionDetailsScreenStyles.backButtonDark]
    : SessionDetailsScreenStyles.backButton;
  
  const backButtonTextStyle = isDarkMode
    ? [SessionDetailsScreenStyles.backButtonText, SessionDetailsScreenStyles.backButtonTextDark]
    : SessionDetailsScreenStyles.backButtonText;
  
  const infoRowStyle = isDarkMode
    ? [SessionDetailsScreenStyles.infoRow, SessionDetailsScreenStyles.infoRowDark]
    : SessionDetailsScreenStyles.infoRow;
  
  const infoLabelStyle = isDarkMode
    ? [SessionDetailsScreenStyles.infoLabel, SessionDetailsScreenStyles.infoLabelDark]
    : SessionDetailsScreenStyles.infoLabel;
  
  const infoValueStyle = isDarkMode
    ? [SessionDetailsScreenStyles.infoValue, SessionDetailsScreenStyles.infoValueDark]
    : SessionDetailsScreenStyles.infoValue;

  // Check if a summary is the "final" summary (generated at end of session)
  const isFinalSummary = (value) => {
    if (value === true || value === 1) return true;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return false;
  };

  // Extract the final summary text (last one marked as final) for display at the top
  const finalSummaries = sessionData?.summaries
    ? sessionData.summaries.filter(summary => isFinalSummary(summary.is_final_summary))
    : [];
  const finalSummaryText = finalSummaries.length > 0
    ? finalSummaries[finalSummaries.length - 1].summary_text
    : null;

  // Export session as plain text file and open the OS share sheet
  const exportSessionAsTxt = async () => {
    if (!sessionData) return showErrorAlert('Export error', 'No session data to export');

    try {
      const lines = [];
      lines.push(`Session: ${sessionData.session_title}`);
      lines.push(`Date: ${formatDateTime(sessionData.start_time)}`);
      lines.push(`Duration: ${calculateDuration(sessionData.start_time, sessionData.end_time)}`);
      lines.push('');
      lines.push('FINAL SUMMARY:');
      lines.push(finalSummaryText || 'No final summary available');
      lines.push('');

      const aiSummaries = sessionData.summaries ? sessionData.summaries.filter(s => !isFinalSummary(s.is_final_summary)) : [];
      if (aiSummaries.length > 0) {
        lines.push('AI Summaries:');
        aiSummaries.forEach((s, i) => {
          lines.push(`Summary ${i + 1} (Segments ${s.chunk_range_start}-${s.chunk_range_end}):`);
          lines.push(s.summary_text || '');
          lines.push('');
        });
      }

      if (sessionData.recording_segments && sessionData.recording_segments.length > 0) {
        lines.push('TRANSCRIPT:');
        sessionData.recording_segments.forEach((seg, i) => {
          const text = seg.english_translation || seg.transcript_text || '';
          lines.push(`Segment ${i + 1}: ${text}`);
        });
      }

      const filename = `session_${sessionId}_${Date.now()}.txt`;
      const fileUri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, lines.join('\n\n'), { encoding: FileSystem.EncodingType.UTF8 });

      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/plain' });
        setSuccessPopup({ visible: true, title: 'Exported', message: 'Session exported and share sheet opened.' });
      } else {
        setSuccessPopup({ visible: true, title: 'Export saved', message: `Export saved to ${fileUri}` });
      }
    } catch (err) {
      console.error('Export error', err);
      showErrorAlert('Export failed', err.message || 'Unknown error while exporting');
    }
  };

  // Export session as PDF by generating HTML and using expo-print
  const exportSessionAsPdf = async () => {
    if (!sessionData) return showErrorAlert('Export error', 'No session data to export');

    try {
      const buildSummaryHtml = () => {
        const esc = (s) => (s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '');
        let html = `<h1>${esc(sessionData.session_title)}</h1>`;
        html += `<p><strong>Date:</strong> ${esc(formatDateTime(sessionData.start_time))}</p>`;
        html += `<p><strong>Duration:</strong> ${esc(calculateDuration(sessionData.start_time, sessionData.end_time))}</p>`;
        html += `<h2>Final Summary</h2><p>${esc(finalSummaryText || 'No final summary available')}</p>`;

        const aiSummaries = sessionData.summaries ? sessionData.summaries.filter(s => !isFinalSummary(s.is_final_summary)) : [];
        if (aiSummaries.length > 0) {
          html += `<h2>AI Summaries</h2>`;
          aiSummaries.forEach((s, i) => {
            html += `<h3>Summary ${i + 1} (Segments ${esc(s.chunk_range_start)}-${esc(s.chunk_range_end)})</h3>`;
            html += `<p>${esc(s.summary_text)}</p>`;
          });
        }

        if (sessionData.recording_segments && sessionData.recording_segments.length > 0) {
          html += `<h2>Transcript</h2>`;
          sessionData.recording_segments.forEach((seg, i) => {
            const text = seg.english_translation || seg.transcript_text || '';
            html += `<p><strong>Segment ${i + 1}:</strong> ${esc(text)}</p>`;
          });
        }

        return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; padding:20px; color:#222} h1{color:#1565C0} h2{color:#2196F3}</style></head><body>${html}</body></html>`;
      };

      const html = buildSummaryHtml();
      const { uri } = await Print.printToFileAsync({ html });

      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
        setSuccessPopup({ visible: true, title: 'Exported', message: 'PDF exported and share sheet opened.' });
      } else {
        setSuccessPopup({ visible: true, title: 'Export saved', message: `PDF saved to ${uri}` });
      }
    } catch (err) {
      console.error('PDF export error', err);
      showErrorAlert('Export failed', err.message || 'Unknown error while exporting PDF');
    }
  };

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
        <View style={SessionDetailsScreenStyles.headerRowContainer}>
          <View style={SessionDetailsScreenStyles.headerLeftSection}>
            <TouchableOpacity onPress={() => setEditingTitle(true)}>
              <Text style={titleStyle}>{sessionData.session_title}</Text>
              <Text style={[subtitleStyle, { marginTop: 4 }]}>Tap to edit</Text>
            </TouchableOpacity>
            
            {/* Time Range and Duration */}
            <View style={SessionDetailsScreenStyles.timeRangeContainer}>
              <Text style={[subtitleStyle, { marginBottom: 4 }]}>
                {formatDateOnly(sessionData.start_time)} • {formatTimeOnly(sessionData.start_time)}
              </Text>
              <Text style={[labelStyle, { marginTop: 6 }]}>
                ⏱️ Duration: {calculateDuration(sessionData.start_time, sessionData.end_time)}
              </Text>
            </View>
          </View>
          
          {/* Status and Segments on Right Side */}
          <View style={SessionDetailsScreenStyles.headerRightSection}>
            <View style={SessionDetailsScreenStyles.statusContainer}>
              <Text style={[labelStyle, { fontSize: 12 }]}>Status</Text>
              <Text style={[infoValueStyle, {
                color: sessionData.status === 'completed' ? '#4CAF50' : 
                       sessionData.status === 'recording' ? '#FF9800' : '#F44336'
              }, SessionDetailsScreenStyles.statusText]}>
                {sessionData.status.toUpperCase()}
              </Text>
            </View>
            <View style={SessionDetailsScreenStyles.segmentsContainer}>
              <Text style={[labelStyle, { fontSize: 12 }]}>Segments</Text>
              <Text style={[infoValueStyle, SessionDetailsScreenStyles.segmentText]}>
                {sessionData.total_segments}
              </Text>
            </View>
            <TouchableOpacity
              style={[backButtonStyle, { marginTop: 8 }]}
              onPress={exportSessionAsPdf}
            >
              <Text style={backButtonTextStyle}>Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={SessionDetailsScreenStyles.scrollView}>
        {/* Overall Session Summary Card */}
        <View style={[summaryCardStyle, SessionDetailsScreenStyles.summaryCardContainer]}>
          <Text style={[sectionTitleStyle, SessionDetailsScreenStyles.summaryHeaderTitle]}>📋 Session Summary</Text>
          
          <View style={SessionDetailsScreenStyles.summaryContentContainer}>
            {finalSummaryText ? (
              <Text style={[summaryTextStyle, isDarkMode && SessionDetailsScreenStyles.summaryContentContainerDark]}>
                {finalSummaryText}
              </Text>
            ) : (
              <Text style={[summaryTextStyle, SessionDetailsScreenStyles.summaryTextItalic]}>
                No summary available for this session yet.
              </Text>
            )}
          </View>
        </View>

        {/* Summaries Section */}
        <TouchableOpacity 
          onPress={() => setExpandedAISummaries(!expandedAISummaries)}
          activeOpacity={0.7}
        >
          <View style={[summaryCardStyle, SessionDetailsScreenStyles.summaryCardContainer]}>
            <View style={SessionDetailsScreenStyles.summaryHeaderRow}>
              <Text style={[sectionTitleStyle, SessionDetailsScreenStyles.summaryHeaderTitle]}>📝 AI Summaries</Text>
              <Text style={[SessionDetailsScreenStyles.summaryExpandIcon, isDarkMode && SessionDetailsScreenStyles.summaryExpandIconDark]}>
                {expandedAISummaries ? '▼' : '▶'}
              </Text>
            </View>
            
            {expandedAISummaries && (
              <View style={SessionDetailsScreenStyles.summaryContentContainer}>
                {sessionData.summaries && sessionData.summaries.filter(s => !isFinalSummary(s.is_final_summary)).length > 0 ? (
                  <View>
                    {sessionData.summaries
                      .filter(summary => !isFinalSummary(summary.is_final_summary))
                      .map((summary, index) => (
                      <View key={summary.id} style={[summaryCardStyle, { marginTop: 12 }]}>
                        <Text style={[labelStyle, SessionDetailsScreenStyles.labelWithMargin]}>
                          Summary {index + 1} (Segments {summary.chunk_range_start}-{summary.chunk_range_end})
                        </Text>
                        <Text style={summaryTextStyle}>{summary.summary_text}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[summaryTextStyle, SessionDetailsScreenStyles.summaryTextItalic]}>
                    No summaries available for this session yet.
                  </Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>

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
                  <View style={SessionDetailsScreenStyles.segmentHeaderRow}>
                    <Text style={labelStyle}>
                      {flippedSegments[segment.id] ? 'Original Transcription' : 'English Translation'}
                    </Text>
                    <Text style={[SessionDetailsScreenStyles.segmentFlipIcon, isDarkMode && SessionDetailsScreenStyles.segmentFlipIconDark]}>
                      {flippedSegments[segment.id] ? '🔄' : '🔄'}
                    </Text>
                  </View>
                  <View style={SessionDetailsScreenStyles.textBlock}>
                    <Text style={flippedSegments[segment.id] ? [originalTextStyle] : [translatedTextStyle]}>
                      {flippedSegments[segment.id] 
                        ? (segment.transcript_text || 'Original text not available')
                        : (segment.english_translation || 'Translation not available')
                      }
                    </Text>
                  </View>
                  {flippedSegments[segment.id] && renderRatingOrBadge(segment.id)}
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
        <View style={SessionDetailsScreenStyles.modalOverlay}>
          <View style={[SessionDetailsScreenStyles.modalContent, isDarkMode && SessionDetailsScreenStyles.modalContentDark]}>
            <Text style={[titleStyle, SessionDetailsScreenStyles.modalTitle]}>Edit Session Title</Text>
            
            <TextInput
              style={[SessionDetailsScreenStyles.modalInput, isDarkMode && SessionDetailsScreenStyles.modalInputDark]}
              placeholder="Enter new title"
              placeholderTextColor="#999"
              value={newTitle}
              onChangeText={setNewTitle}
              editable={!isSaving}
            />

            <View style={SessionDetailsScreenStyles.modalButtonContainer}>
              <TouchableOpacity
                style={[SessionDetailsScreenStyles.modalButton, SessionDetailsScreenStyles.modalCancelButton]}
                onPress={() => setEditingTitle(false)}
                disabled={isSaving}
              >
                <Text style={SessionDetailsScreenStyles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[SessionDetailsScreenStyles.modalButton, SessionDetailsScreenStyles.modalSaveButton]}
                onPress={handleEditTitle}
                disabled={isSaving}
              >
                <Text style={SessionDetailsScreenStyles.modalSaveButtonText}>
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
