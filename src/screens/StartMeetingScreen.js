import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StartMeetingScreenStyles from '../styles/StartMeetingScreenStyles';
import ThemeToggleButton from '../components/ThemeToggleButton';
import MessagePopup from '../components/popup/MessagePopup';
import { createMeetingSession } from '../services/apiService';
import { checkBackendConnection, getConnectionTroubleshootingMessage } from '../utils/connectionHelper';

const StartMeetingScreen = (props) => {
  const { isDarkMode, onToggleDarkMode, navigation } = props;
  const [meetingTitle, setMeetingTitle] = useState('');
  const [messagePopup, setMessagePopup] = useState({ visible: false, title: '', message: '' });



  const handleStartRecording = async () => {
    try {
      console.log('🎙️ Starting session creation...');
      
      // Check backend connection first
      setMessagePopup({ visible: true, title: '', message: 'Checking backend connection...' });
      const connectionCheck = await checkBackendConnection();
      
      if (!connectionCheck.success) {
        const troubleshooting = getConnectionTroubleshootingMessage();
        setMessagePopup({ 
          visible: true, 
          title: '❌ Backend Connection Failed', 
          message: `${connectionCheck.message}\n\n${troubleshooting}`
        });
        return;
      }
      
      console.log('✅ Backend is reachable');

      // Create session
      setMessagePopup({ visible: true, title: '', message: 'Creating session...' });
      const sessionResponse = await createMeetingSession({
        session_title: meetingTitle.trim() || 'Untitled Meeting'
      });

      if (!sessionResponse.success) {
        throw new Error(sessionResponse.error || 'Failed to create session');
      }

      const newSessionId = sessionResponse.data.id;
      console.log('✅ Session created:', newSessionId);

      // Navigate to StartRecord screen with session ID and title
      navigation.navigate('StartRecord', {
        sessionId: newSessionId,
        meetingTitle: meetingTitle.trim() || 'Untitled Meeting'
      });

    } catch (error) {
      console.error('❌ Error:', error);
      setMessagePopup({ 
        visible: true, 
        title: 'Error', 
        message: error.message || 'Failed to create session' 
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
      borderColor: '#444444',
    },
  ];
  const buttonStyle = [
    StartMeetingScreenStyles.button,
    isDarkMode && { backgroundColor: '#444' },
  ];
  const startButtonStyle = [
    StartMeetingScreenStyles.startButton,
    isDarkMode && { backgroundColor: '#007e34ff' },
  ];
  const infoContainerStyle = [
    StartMeetingScreenStyles.infoContainer,
    isDarkMode && { backgroundColor: '#333', borderColor: '#444444' },
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
            />
          </View>

          <View style={StartMeetingScreenStyles.buttonContainer}>
            <TouchableOpacity
              style={[buttonStyle, startButtonStyle]}
              onPress={handleStartRecording}
            >
              <Text style={StartMeetingScreenStyles.buttonText}>Start Recording</Text>
            </TouchableOpacity>
          </View>

          <View style={infoContainerStyle}>
            <Text style={infoTitleStyle}>Recording Features:</Text>
            <Text style={infoTextStyle}>• Audio transcribe</Text>
            <Text style={infoTextStyle}>• Taglish-To-English Translation</Text>
            <Text style={infoTextStyle}>• Meeting summary (every 10 segments)</Text>
            <Text style={infoTextStyle}>• Smart chunking (max 10s per segment)</Text>
            <Text style={infoTextStyle}>• Backend VAD filtering</Text>
          </View>
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