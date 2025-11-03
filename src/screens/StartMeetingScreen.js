import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import StartMeetingScreenStyles from '../styles/StartMeetingScreenStyles';
import ThemeToggleButton from '../components/ThemeToggleButton';
import MessagePopup from '../components/MessagePopup';

const StartMeetingScreen = (props) => {
  const { isDarkMode, onToggleDarkMode } = props;
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messagePopup, setMessagePopup] = useState({ visible: false, title: '', message: '' });

  const handleStartRecording = () => {
    if (!meetingTitle.trim()) {
      setMessagePopup({ visible: true, title: 'Error', message: 'Please enter a meeting title' });
      return;
    }

    setIsRecording(true);
    setMessagePopup({ visible: true, title: 'Recording Started', message: 'Your meeting is now being recorded' });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setMessagePopup({ visible: true, title: 'Recording Stopped', message: 'Your recording has been saved' });
    setMeetingTitle('');
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
          <Text style={statusTextStyle}>
            {isRecording ? 'Recording in progress...' : 'Ready to record'}
          </Text>
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

        <View style={infoContainerStyle}>
          <Text style={infoTitleStyle}>Recording Features:</Text>
          <Text style={infoTextStyle}>• Audio transcribe</Text>
          <Text style={infoTextStyle}>• Taglish-To-English Translation</Text>
          <Text style={infoTextStyle}>• Meeting summary</Text>
          <Text style={infoTextStyle}>• Noise suppression</Text>
        </View>
      </View>

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