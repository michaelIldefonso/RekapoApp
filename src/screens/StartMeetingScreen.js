import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import StartMeetingScreenStyles from '../styles/StartMeetingScreenStyles';
import ThemeToggleButton from '../components/ThemeToggleButton';
import MessagePopup from '../components/popup/MessagePopup';
import { createMeetingSession, updateMeetingSession, connectTranscriptionWebSocket } from '../services/apiService';

const StartMeetingScreen = (props) => {
  const { isDarkMode, onToggleDarkMode } = props;
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messagePopup, setMessagePopup] = useState({ visible: false, title: '', message: '' });
  
  // New states for transcription
  const [sessionId, setSessionId] = useState(null);
  const [transcriptions, setTranscriptions] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('Ready to record');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaries, setSummaries] = useState([]);
  
  // Refs
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const wsRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const recordingTimeoutsRef = useRef([]);
  const recordingStartTimeRef = useRef(null);
  const isRecordingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Mark recording as stopped so any in-flight loops exit
      isRecordingRef.current = false;

      // Close websocket if any
      if (wsRef.current) {
        try { wsRef.current.close(); } catch (e) { /* ignore */ }
        wsRef.current = null;
      }

      // Clear any intervals
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // Clear any pending timeouts used for chunk scheduling/retry
      if (recordingTimeoutsRef.current && recordingTimeoutsRef.current.length > 0) {
        recordingTimeoutsRef.current.forEach(id => clearTimeout(id));
        recordingTimeoutsRef.current = [];
      }

      // Try to stop recorder if it's still recording. Don't await here.
      try {
        if (recorder && recorder.isRecording) {
          recorder.stop();
        }
      } catch (e) {
        // Ignore errors during unmount cleanup — recorder native object may already be released
        console.log('Recorder stop during cleanup error:', e?.message || e);
      }
    };
  }, [recorder]);

  const handleStartRecording = async () => {
    try {
      console.log('🎙️ Starting recording process...');

      // Request permissions
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        setMessagePopup({ 
          visible: true, 
          title: 'Permission Denied', 
          message: 'Microphone permission is required for recording' 
        });
        return;
      }
      console.log('✅ Audio permissions granted');

      // Set audio mode for recording
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      console.log('✅ Audio mode configured');

      // Create session (using temporary title for now)
      setCurrentStatus('Creating session...');
      const sessionResponse = await createMeetingSession({
        session_title: meetingTitle.trim() || 'Untitled Meeting'
      });

      if (!sessionResponse.success) {
        throw new Error(sessionResponse.error || 'Failed to create session');
      }

      // Backend returns { id, session_title, start_time, status, ... }
      const newSessionId = sessionResponse.data.id;
      setSessionId(newSessionId);
      console.log('✅ Session created:', newSessionId);

      // Connect WebSocket
      setCurrentStatus('Connecting to transcription service...');
      const ws = connectTranscriptionWebSocket(
        newSessionId,
        handleWebSocketMessage,
        handleWebSocketError,
        handleWebSocketClose
      );
      wsRef.current = ws;

      // Start recording with 10-second chunks
      setIsRecording(true);
      isRecordingRef.current = true;
      setCurrentStatus('Recording...');
      setMessagePopup({ 
        visible: true, 
        title: 'Recording Started', 
        message: 'Your meeting is being transcribed in real-time' 
      });

      startRecordingChunks();

    } catch (error) {
      console.error('❌ Start recording error:', error);
      
      // Reset all states on error
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsProcessing(false);
      
      // Close websocket if it was opened
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          console.log('Error closing websocket:', e);
        }
        wsRef.current = null;
      }
      
      // Clear session if it was created
      if (sessionId) {
        setSessionId(null);
      }
      
      setMessagePopup({ 
        visible: true, 
        title: 'Error', 
        message: error.message || 'Failed to start recording' 
      });
      setCurrentStatus('Ready to record');
    }
  };

  const startRecordingChunks = async () => {
    const HARD_LIMIT_MS = 10000; // 10 seconds hard limit
    
    const recordChunk = async () => {
      try {
        // Check if we should still be recording
        if (!isRecordingRef.current) {
          console.log('⚠️ isRecordingRef is false, stopping chunks');
          return;
        }

        // Prepare recorder for new recording
        console.log('🔴 Preparing recorder...');
        await recorder.prepareToRecordAsync();
        console.log('✅ Recorder prepared, starting recording...');
        recordingStartTimeRef.current = Date.now();
        
        // Start recording
        console.log('▶️ Calling recorder.record()...');
        recorder.record();
        
        // Check state immediately after
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('✅ Recording started!', {
          isRecording: recorder.isRecording,
          canRecord: recorder.canRecord,
          uri: recorder.uri,
          durationMillis: recorder.durationMillis
        });
        setCurrentStatus('Recording... (listening)');

        // Wait for hard limit
        await new Promise(resolve => setTimeout(resolve, HARD_LIMIT_MS));

        // Check if still recording
        console.log('⏱️ 10s elapsed, stopping...');

        if (!isRecordingRef.current) {
          console.log('⚠️ Global recording flag is false, stopping');
          if (recorder.isRecording) {
            await recorder.stop();
          }
          setIsProcessing(false);
          setCurrentStatus('Recording stopped');
          return;
        }

        // Stop and get URI
        console.log('⏹️ Stopping recording...');
        await recorder.stop();
        
        console.log('🛑 After stop, state:', {
          isRecording: recorder.isRecording,
          uri: recorder.uri,
          durationMillis: recorder.durationMillis
        });
        
        const uri = recorder.uri;
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
        console.log(`📊 Recording duration: ${duration.toFixed(1)}s, URI:`, uri);

        // Only send if we have meaningful audio (at least 0.5s)
        if (uri && wsRef.current && duration > 0.5) {
          try {
            setIsProcessing(true);
            setCurrentStatus('Processing audio...');
            console.log(`📤 Sending chunk: ${duration.toFixed(1)}s`);
            
            // Read file and convert to base64
            const base64 = await FileSystem.readAsStringAsync(uri, {
              encoding: 'base64',
            });
            
            console.log(`✅ Base64 length: ${base64.length} characters`);
            console.log(`📦 Estimated size: ${(base64.length / 1024).toFixed(2)} KB`);

            // Send the original audio chunk directly (frontend noise filtering removed)
            try {
              if (wsRef.current.connection.readyState === WebSocket.OPEN) {
                wsRef.current.sendAudioChunk(base64, null, 'small');
                console.log('✅ Chunk sent (original, no frontend filter)');
              } else {
                console.error('❌ WebSocket not open, readyState:', wsRef.current.connection.readyState);
              }
            } catch (sendErr) {
              console.error('❌ Error sending chunk:', sendErr);
            }
          } catch (sendError) {
            console.error('❌ Error sending chunk:', sendError);
          }
        } else {
          console.log('⏭️ Skipping chunk - too short or no audio');
        }

        // Start next chunk if still recording
        if (isRecordingRef.current) {
          console.log('🔄 Starting next chunk...');
          const id = setTimeout(() => recordChunk(), 100);
          recordingTimeoutsRef.current.push(id);
        }

      } catch (error) {
        console.error('❌ Recording chunk error:', error);
        setCurrentStatus('Recording error: ' + error.message);
        setIsProcessing(false);
        
        // Stop recording on critical errors to prevent infinite loops
        if (!isRecordingRef.current) {
          console.log('⚠️ Stopping due to error and flag check');
          return;
        }
        
        // Retry with a limit
        const retryCount = (recordChunk.retryCount || 0) + 1;
        if (retryCount > 3) {
          console.error('❌ Max retries reached, stopping recording');
          setIsRecording(false);
          isRecordingRef.current = false;
          setCurrentStatus('Recording failed - too many errors');
          setMessagePopup({
            visible: true,
            title: 'Recording Error',
            message: 'Recording stopped due to repeated errors. Please try again.'
          });
          return;
        }
        
        recordChunk.retryCount = retryCount;
        console.log(`🔄 Retry attempt ${retryCount}/3`);
        
        if (isRecordingRef.current) {
          const id = setTimeout(() => recordChunk(), 1000);
          recordingTimeoutsRef.current.push(id);
        }
      }
    };

    // Start first chunk
    console.log('🚀 Starting first recording chunk, isRecordingRef:', isRecordingRef.current);
    await recordChunk();
  };

  const handleWebSocketMessage = (data) => {
    console.log('📨 WebSocket message:', data.status);
    
    if (data.status === 'processing') {
      setCurrentStatus(`Processing segment ${data.segment_number}...`);
    } else if (data.status === 'success') {
      setIsProcessing(false);
      setCurrentStatus('Recording...');
      
      // Add transcription to list
      setTranscriptions(prev => [...prev, {
        segment: data.segment_number,
        original: data.transcription,
        translation: data.english_translation,
        language: data.language,
        duration: data.duration
      }]);
    } else if (data.status === 'summary') {
      // Add summary to list
      setSummaries(prev => [...prev, {
        range: `Segments ${data.session_id}`,
        text: data.summary,
        chunkCount: data.chunk_count
      }]);
      
      setMessagePopup({
        visible: true,
        title: '📝 Summary Generated',
        message: data.summary
      });
    } else if (data.status === 'error') {
      console.error('WebSocket error:', data.message);
      setCurrentStatus('Error: ' + data.message);
    }
  };

  const handleWebSocketError = (error) => {
    console.error('WebSocket error:', error);
    setCurrentStatus('Connection error');
  };

  const handleWebSocketClose = () => {
    console.log('WebSocket closed');
    if (isRecording) {
      setCurrentStatus('Connection lost');
    }
  };

  const handleStopRecording = async () => {
    try {
      // Set flag to stop recording immediately
      setIsRecording(false);
      isRecordingRef.current = false;
      setCurrentStatus('Stopping...');

      // Stop recording first
      if (recorder.isRecording) {
        try {
          await recorder.stop();
        } catch (e) {
          console.log('Recorder already stopped');
        }
      }

      // Clear any intervals
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Update session status to completed
      if (sessionId) {
        try {
          await updateMeetingSession(sessionId, { status: 'completed' });
          console.log('✅ Session marked as completed');
        } catch (error) {
          console.error('Failed to update session status:', error);
        }
      }

      setCurrentStatus('Recording stopped');
      setMessagePopup({ 
        visible: true, 
        title: 'Recording Stopped', 
        message: `Meeting saved with ${transcriptions.length} segments transcribed` 
      });

      // Reset for next session
      setTimeout(() => {
        setSessionId(null);
        setTranscriptions([]);
        setSummaries([]);
        setMeetingTitle('');
        setCurrentStatus('Ready to record');
      }, 2000);

    } catch (error) {
      console.error('Stop recording error:', error);
      setMessagePopup({ 
        visible: true, 
        title: 'Error', 
        message: 'Failed to stop recording properly' 
      });
    }
  };

  // Dynamic styles for dark mode
  const containerStyle = [
    StartMeetingScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const titleStyle = [
    StartMeetingScreenStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  const subtitleStyle = [
    StartMeetingScreenStyles.subtitle,
    isDarkMode && { color: '#fff' },
  ];
  const labelStyle = [
    StartMeetingScreenStyles.label,
    isDarkMode && { color: '#fff' },
  ];
  const inputStyle = [
    StartMeetingScreenStyles.input,
    isDarkMode && {
      backgroundColor: '#333',
      color: '#fff',
      borderColor: '#fff',
    },
  ];
  const statusContainerStyle = [
    StartMeetingScreenStyles.statusContainer,
    isDarkMode && { backgroundColor: '#333', borderColor: '#fff', shadowOpacity: 0 },
  ];
  const statusTextStyle = [
    StartMeetingScreenStyles.statusText,
    isDarkMode && { color: '#fff' },
  ];
  const buttonStyle = [
    StartMeetingScreenStyles.button,
    isDarkMode && { backgroundColor: '#444' },
  ];
  const startButtonStyle = [
    StartMeetingScreenStyles.startButton,
    isDarkMode && { backgroundColor: '#007e34ff' },
  ];
  const stopButtonStyle = [
    StartMeetingScreenStyles.stopButton,
    isDarkMode && { backgroundColor: '#e74c3c' },
  ];
  const infoContainerStyle = [
    StartMeetingScreenStyles.infoContainer,
    isDarkMode && { backgroundColor: '#333' },
  ];
  const infoTitleStyle = [
    StartMeetingScreenStyles.infoTitle,
    isDarkMode && { color: '#fff' },
  ];
  const infoTextStyle = [
    StartMeetingScreenStyles.infoText,
    isDarkMode && { color: '#ffffffff' },
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={StartMeetingScreenStyles.scrollView}>
        <View style={StartMeetingScreenStyles.content}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={titleStyle}>Start New Meeting</Text>
            <View style={StartMeetingScreenStyles.themeToggleButtonWrapper}>
              <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
            </View>
          </View>
          <Text style={subtitleStyle}>Set up your recording session</Text>

          <View style={StartMeetingScreenStyles.inputContainer}>
            <Text style={labelStyle}>Meeting Title</Text>
            <TextInput
              style={inputStyle}
              placeholder="Enter meeting title..."
              placeholderTextColor={isDarkMode ? '#bbb' : undefined}
              value={meetingTitle}
              onChangeText={setMeetingTitle}
              editable={!isRecording}
            />
          </View>

          <View style={statusContainerStyle}>
            <View style={[
              StartMeetingScreenStyles.statusIndicator,
              isRecording
                ? StartMeetingScreenStyles.statusIndicatorRecording
                : StartMeetingScreenStyles.statusIndicatorIdle,
            ]} />
            <Text style={statusTextStyle}>{currentStatus}</Text>
            {isProcessing && (
              <ActivityIndicator 
                size="small" 
                color={isDarkMode ? '#fff' : '#000'} 
                style={{ marginLeft: 10 }}
              />
            )}
          </View>

          <View style={StartMeetingScreenStyles.buttonContainer}>
            {!isRecording ? (
              <TouchableOpacity
                style={[buttonStyle, startButtonStyle]}
                onPress={handleStartRecording}
              >
                <Text style={StartMeetingScreenStyles.buttonText}>Start Recording</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[buttonStyle, stopButtonStyle]}
                onPress={handleStopRecording}
              >
                <Text style={StartMeetingScreenStyles.buttonText}>Stop Recording</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Transcriptions Display */}
          {transcriptions.length > 0 && (
            <View style={[
              StartMeetingScreenStyles.transcriptionContainer,
              isDarkMode && { backgroundColor: '#333', borderColor: '#555' }
            ]}>
              <Text style={[
                StartMeetingScreenStyles.transcriptionTitle,
                isDarkMode && { color: '#fff' }
              ]}>
                Live Transcription ({transcriptions.length} segments)
              </Text>
              <ScrollView 
                style={StartMeetingScreenStyles.transcriptionScroll}
                nestedScrollEnabled={true}
              >
                {transcriptions.slice().reverse().map((item, index) => (
                  <View 
                    key={index} 
                    style={[
                      StartMeetingScreenStyles.transcriptionItem,
                      isDarkMode && { backgroundColor: '#444', borderColor: '#555' }
                    ]}
                  >
                    <Text style={[
                      StartMeetingScreenStyles.segmentNumber,
                      isDarkMode && { color: '#aaa' }
                    ]}>
                      Segment {item.segment} • {item.language.toUpperCase()} • {item.duration?.toFixed(1)}s
                    </Text>
                    <Text style={[
                      StartMeetingScreenStyles.transcriptionText,
                      isDarkMode && { color: '#fff' }
                    ]}>
                      {item.original}
                    </Text>
                    {item.translation !== item.original && (
                      <Text style={[
                        StartMeetingScreenStyles.translationText,
                        isDarkMode && { color: '#4CAF50' }
                      ]}>
                        🇬🇧 {item.translation}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Summaries Display */}
          {summaries.length > 0 && (
            <View style={[
              StartMeetingScreenStyles.summaryContainer,
              isDarkMode && { backgroundColor: '#333', borderColor: '#555' }
            ]}>
              <Text style={[
                StartMeetingScreenStyles.summaryTitle,
                isDarkMode && { color: '#fff' }
              ]}>
                📝 Meeting Summaries ({summaries.length})
              </Text>
              {summaries.map((summary, index) => (
                <View 
                  key={index}
                  style={[
                    StartMeetingScreenStyles.summaryItem,
                    isDarkMode && { backgroundColor: '#444' }
                  ]}
                >
                  <Text style={[
                    StartMeetingScreenStyles.summaryRange,
                    isDarkMode && { color: '#aaa' }
                  ]}>
                    {summary.range}
                  </Text>
                  <Text style={[
                    StartMeetingScreenStyles.summaryText,
                    isDarkMode && { color: '#fff' }
                  ]}>
                    {summary.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {!isRecording && (
            <View style={infoContainerStyle}>
              <Text style={infoTitleStyle}>Recording Features:</Text>
              <Text style={infoTextStyle}>• Audio transcribe</Text>
              <Text style={infoTextStyle}>• Taglish-To-English Translation</Text>
              <Text style={infoTextStyle}>• Meeting summary (every 10 segments)</Text>
              <Text style={infoTextStyle}>• Smart chunking (max 10s per segment)</Text>
              <Text style={infoTextStyle}>• Backend VAD filtering</Text>
            </View>
          )}
        </View>
      </ScrollView>

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

export default StartMeetingScreen;