import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import StartRecordStyles from '../styles/StartRecordStyles';
import ThemeToggleButton from '../components/ThemeToggleButton';
import MessagePopup from '../components/popup/MessagePopup';
import SummariesPopup from '../components/popup/SummariesPopup';
import { updateMeetingSession, connectTranscriptionWebSocket } from '../services/apiService';

const StartRecord = (props) => {
  const { isDarkMode, onToggleDarkMode, route, navigation } = props;
  const { sessionId, meetingTitle } = route.params;

  const [isRecording, setIsRecording] = useState(false);
  const [messagePopup, setMessagePopup] = useState({ visible: false, title: '', message: '' });
  const [showSummariesPopup, setShowSummariesPopup] = useState(false);
  
  // Transcription states
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
      console.log('🧹 Cleanup: StartRecord component unmounting');
      
      isRecordingRef.current = false;

      if (recordingTimeoutsRef.current && recordingTimeoutsRef.current.length > 0) {
        console.log('🧹 Clearing', recordingTimeoutsRef.current.length, 'pending timeouts');
        recordingTimeoutsRef.current.forEach(id => clearTimeout(id));
        recordingTimeoutsRef.current = [];
      }

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      if (wsRef.current) {
        try { 
          console.log('🧹 Closing websocket');
          wsRef.current.close(); 
        } catch (e) { 
          console.log('Websocket close error:', e?.message);
        }
        wsRef.current = null;
      }

      setTimeout(() => {
        try {
          if (recorder && recorder.isRecording) {
            console.log('🧹 Stopping active recorder');
            recorder.stop();
          }
        } catch (e) {
          console.log('Recorder stop during cleanup (ignored):', e?.message || e);
        }
      }, 50);
    };
  }, [recorder]);

  // Auto-start recording when component mounts
  useEffect(() => {
    handleStartRecording();
  }, []);

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

      // Connect WebSocket with retry logic
      setCurrentStatus('Connecting to transcription service...');
      try {
        const ws = await connectTranscriptionWebSocket(
          sessionId,
          handleWebSocketMessage,
          handleWebSocketError,
          handleWebSocketClose
        );
        
        // Wait for connection to open (max 5 seconds)
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('WebSocket connection timeout'));
          }, 5000);
          
          if (ws.connection.readyState === WebSocket.OPEN) {
            clearTimeout(timeout);
            resolve();
          } else {
            ws.connection.onopen = () => {
              clearTimeout(timeout);
              resolve();
            };
            ws.connection.onerror = (err) => {
              clearTimeout(timeout);
              reject(new Error('WebSocket connection failed'));
            };
          }
        });
        
        wsRef.current = ws;
        console.log('✅ WebSocket connected and ready');
      } catch (wsError) {
        throw new Error(`Failed to connect to transcription service: ${wsError.message}`);
      }

      // Start recording with 20-second chunks
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
      
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsProcessing(false);
      
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          console.log('Error closing websocket:', e);
        }
        wsRef.current = null;
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
    const HARD_LIMIT_MS = 20000; // 20 seconds hard limit
    
    const recordChunk = async () => {
      try {
        if (!isRecordingRef.current) {
          console.log('⚠️ isRecordingRef is false, stopping chunks');
          return;
        }

        if (!recorder) {
          console.log('⚠️ Recorder object is null, stopping chunks');
          isRecordingRef.current = false;
          return;
        }

        console.log('🔴 Preparing recorder...');
        try {
          await recorder.prepareToRecordAsync();
        } catch (prepError) {
          console.log('⚠️ Recorder prepare failed (likely released):', prepError.message);
          isRecordingRef.current = false;
          return;
        }
        
        console.log('✅ Recorder prepared, starting recording...');
        recordingStartTimeRef.current = Date.now();
        
        console.log('▶️ Calling recorder.record()...');
        try {
          recorder.record();
        } catch (recordError) {
          console.log('⚠️ Recorder record failed (likely released):', recordError.message);
          isRecordingRef.current = false;
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          console.log('✅ Recording started!', {
            isRecording: recorder.isRecording,
            canRecord: recorder.canRecord,
            uri: recorder.uri,
            durationMillis: recorder.durationMillis
          });
        } catch (stateError) {
          console.log('⚠️ Cannot read recorder state (likely released)');
          isRecordingRef.current = false;
          return;
        }
        
        setCurrentStatus('Recording... (listening)');

        await new Promise(resolve => setTimeout(resolve, HARD_LIMIT_MS));

        console.log('⏱️ 20s elapsed, stopping...');

        if (!isRecordingRef.current) {
          console.log('⚠️ Global recording flag is false, stopping');
          try {
            if (recorder && recorder.isRecording) {
              await recorder.stop();
            }
          } catch (stopError) {
            console.log('⚠️ Stop failed during flag check (ignored):', stopError.message);
          }
          setIsProcessing(false);
          setCurrentStatus('Recording stopped');
          return;
        }

        console.log('⏹️ Stopping recording...');
        let uri = null;
        try {
          if (recorder && recorder.isRecording) {
            await recorder.stop();
            uri = recorder.uri;
          }
        } catch (stopError) {
          console.log('⚠️ Recorder stop failed (likely released):', stopError.message);
          isRecordingRef.current = false;
          return;
        }
        
        try {
          console.log('🛑 After stop, state:', {
            isRecording: recorder.isRecording,
            uri: recorder.uri,
            durationMillis: recorder.durationMillis
          });
        } catch (stateError) {
          console.log('⚠️ Cannot read recorder state after stop');
        }
        
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
        console.log(`📊 Recording duration: ${duration.toFixed(1)}s, URI:`, uri);

        // 🚀 START NEXT RECORDING IMMEDIATELY (parallel processing - eliminates gap)
        if (isRecordingRef.current) {
          console.log('🔄 Starting next chunk NOW (while processing previous)...');
          const id = setTimeout(() => recordChunk(), 0); // Start immediately
          recordingTimeoutsRef.current.push(id);
        }

        // Process previous chunk in parallel (non-blocking)
        if (uri && wsRef.current && duration > 0.5) {
          // Fire-and-forget: don't await, let it run in background
          (async () => {
            try {
              setIsProcessing(true);
              setCurrentStatus('Processing audio...');
              console.log(`📤 Sending chunk: ${duration.toFixed(1)}s`);
              
              const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
              });
              
              console.log(`✅ Base64 length: ${base64.length} characters`);
              console.log(`📦 Estimated size: ${(base64.length / 1024).toFixed(2)} KB`);

              try {
                if (wsRef.current && wsRef.current.connection.readyState === WebSocket.OPEN) {
                  wsRef.current.sendAudioChunk(base64, null, 'small');
                  console.log('✅ Chunk sent (original, no frontend filter)');
                } else {
                  console.error('❌ WebSocket not open, readyState:', wsRef.current?.connection.readyState);
                }
              } catch (sendErr) {
                console.error('❌ Error sending chunk:', sendErr);
              }
            } catch (sendError) {
              console.error('❌ Error sending chunk:', sendError);
            } finally {
              setIsProcessing(false);
            }
          })();
        } else {
          console.log('⏭️ Skipping chunk - too short or no audio');
        }

      } catch (error) {
        console.error('❌ Recording chunk error:', error);
        setCurrentStatus('Recording error: ' + error.message);
        setIsProcessing(false);
        
        if (!isRecordingRef.current) {
          console.log('⚠️ Stopping due to error and flag check');
          return;
        }
        
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
      
      setTranscriptions(prev => [...prev, {
        segment: data.segment_number,
        original: data.transcription,
        translation: data.english_translation,
        language: data.language,
        duration: data.duration
      }]);
    } else if (data.status === 'summary') {
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
    console.error('❌ WebSocket error in screen:', error);
    setCurrentStatus('Connection error - Check backend server');
    
    if (isRecording) {
      setMessagePopup({
        visible: true,
        title: '⚠️ Connection Error',
        message: 'Lost connection to transcription service. Please check if the backend server is running.'
      });
    }
  };

  const handleWebSocketClose = (event) => {
    console.log('🔌 WebSocket closed in screen');
    if (event && event.code) {
      console.log('Close code:', event.code, 'Reason:', event.reason);
    }
    
    if (isRecording) {
      setCurrentStatus('Connection lost');
      setMessagePopup({
        visible: true,
        title: '⚠️ Connection Lost',
        message: 'Transcription service disconnected. Recording stopped.'
      });
      
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      isRecordingRef.current = false;
      setCurrentStatus('Stopping...');

      if (recorder.isRecording) {
        try {
          await recorder.stop();
        } catch (e) {
          console.log('Recorder already stopped');
        }
      }

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

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

      setTimeout(() => {
        navigation.goBack();
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
    StartRecordStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const headerStyle = [
    StartRecordStyles.headerContainer,
    isDarkMode && { backgroundColor: '#333', borderBottomColor: '#444' },
  ];
  const headerTitleStyle = [
    StartRecordStyles.headerTitle,
    isDarkMode && { color: '#fff' },
  ];
  const miniStatusStyle = [
    StartRecordStyles.miniStatusContainer,
    isDarkMode && { backgroundColor: '#333', borderBottomColor: '#444' },
  ];
  const statusTextStyle = [
    StartRecordStyles.statusText,
    isDarkMode && { color: '#aaa' },
  ];
  const buttonContainerStyle = [
    StartRecordStyles.buttonContainer,
    isDarkMode && { backgroundColor: '#333', borderBottomColor: '#444' },
  ];
  const buttonStyle = [
    StartRecordStyles.button,
    isDarkMode && { backgroundColor: '#444' },
  ];
  const stopButtonStyle = [
    StartRecordStyles.stopButton,
    isDarkMode && { backgroundColor: '#e74c3c' },
  ];
  const transcriptionContainerStyle = [
    StartRecordStyles.transcriptionContainer,
    isDarkMode && { backgroundColor: '#222', borderTopColor: '#444' },
  ];
  const transcriptionTitleStyle = [
    StartRecordStyles.transcriptionTitle,
    isDarkMode && { backgroundColor: '#333', color: '#fff', borderBottomColor: '#444' },
  ];
  const transcriptionItemStyle = [
    StartRecordStyles.transcriptionItem,
    isDarkMode && { backgroundColor: '#333', borderColor: '#444' },
  ];
  const segmentNumberStyle = [
    StartRecordStyles.segmentNumber,
    isDarkMode && { color: '#999' },
  ];
  const transcriptionTextStyle = [
    StartRecordStyles.transcriptionText,
    isDarkMode && { color: '#fff' },
  ];
  const translationTextStyle = [
    StartRecordStyles.translationText,
    isDarkMode && { color: '#4CAF50' },
  ];

  return (
    <SafeAreaView style={containerStyle}>
      {/* Minimal Header */}
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>{meetingTitle || 'Recording'}</Text>
        <View style={StartRecordStyles.themeToggleButtonWrapper}>
          <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
        </View>
      </View>

      {/* Compact Status */}
      <View style={miniStatusStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={[
            StartRecordStyles.statusIndicator,
            isRecording
              ? StartRecordStyles.statusIndicatorRecording
              : StartRecordStyles.statusIndicatorIdle,
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
        <TouchableOpacity
          style={[buttonStyle, stopButtonStyle]}
          onPress={handleStopRecording}
        >
          <Text style={StartRecordStyles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      {/* Summarize Button */}
      <TouchableOpacity
        style={[
          StartRecordStyles.button,
          { backgroundColor: '#4CAF50', marginHorizontal: 12, marginVertical: 8, paddingVertical: 12 },
          isDarkMode && { backgroundColor: '#45a049' }
        ]}
        onPress={() => setShowSummariesPopup(true)}
      >
        <Text style={[StartRecordStyles.buttonText, { fontSize: 16, fontWeight: '600' }]}>📝 Summarize</Text>
      </TouchableOpacity>

      {/* Stop Button - HIDDEN */}
      <View style={buttonContainerStyle}>
        <TouchableOpacity
          style={[buttonStyle, stopButtonStyle]}
          onPress={handleStopRecording}
        >
          <Text style={StartRecordStyles.buttonText}>Stop Recording</Text>
        </TouchableOpacity>
      </View>

      {/* Main Transcription Area - takes most of screen */}
      {transcriptions.length > 0 ? (
        <View style={transcriptionContainerStyle}>
          <Text style={transcriptionTitleStyle}>
            Live Transcription ({transcriptions.length} segments)
          </Text>
          <ScrollView 
            style={StartRecordStyles.transcriptionScroll}
            nestedScrollEnabled={true}
          >
            {transcriptions.map((item, index) => (
              <View 
                key={index} 
                style={transcriptionItemStyle}
              >
                <Text style={translationTextStyle}>
                  {item.translation}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={[
          transcriptionContainerStyle,
          { justifyContent: 'center', alignItems: 'center' }
        ]}>
          <Text style={[transcriptionTitleStyle, { borderBottomWidth: 0 }]}>
            Waiting for transcriptions...
          </Text>
        </View>
      )}

      {/* Summaries at bottom (compact) */}
      {summaries.length > 0 && (
        <View style={[
          StartRecordStyles.summaryContainer,
          isDarkMode && { backgroundColor: '#333', borderTopColor: '#444' }
        ]}>
          <Text style={[
            StartRecordStyles.summaryTitle,
            isDarkMode && { color: '#fff' }
          ]}>
            📝 Summaries
          </Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {summaries.map((summary, index) => (
              <View 
                key={index}
                style={[
                  StartRecordStyles.summaryItem,
                  isDarkMode && { backgroundColor: '#444' }
                ]}
              >
                <Text style={[
                  StartRecordStyles.summaryText,
                  isDarkMode && { color: '#fff' }
                ]}>
                  {summary.text.substring(0, 80)}...
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <MessagePopup
        visible={messagePopup.visible}
        title={messagePopup.title}
        message={messagePopup.message}
        onClose={() => setMessagePopup({ visible: false, title: '', message: '' })}
        isDarkMode={isDarkMode}
      />

      <SummariesPopup
        visible={showSummariesPopup}
        summaries={summaries}
        isDarkMode={isDarkMode}
        onClose={() => setShowSummariesPopup(false)}
      />
    </SafeAreaView>
  );
};

export default StartRecord;
