import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import StartMeetingScreenStyles from '../styles/StartMeetingScreenStyles';

const StartMeetingScreen = () => {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecording = () => {
    if (!meetingTitle.trim()) {
      Alert.alert('Error', 'Please enter a meeting title');
      return;
    }

    setIsRecording(true);
    Alert.alert('Recording Started', 'Your meeting is now being recorded');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    Alert.alert('Recording Stopped', 'Your recording has been saved');
    setMeetingTitle('');
  };

  return (
    <SafeAreaView style={StartMeetingScreenStyles.container}>
      <View style={StartMeetingScreenStyles.content}>
        <Text style={StartMeetingScreenStyles.title}>Start New Meeting</Text>
        <Text style={StartMeetingScreenStyles.subtitle}>Set up your recording session</Text>

        <View style={StartMeetingScreenStyles.inputContainer}>
          <Text style={StartMeetingScreenStyles.label}>Meeting Title</Text>
          <TextInput
            style={StartMeetingScreenStyles.input}
            placeholder="Enter meeting title..."
            value={meetingTitle}
            onChangeText={setMeetingTitle}
            editable={!isRecording}
          />
        </View>

        <View style={StartMeetingScreenStyles.statusContainer}>
          <View style={[StartMeetingScreenStyles.statusIndicator, { backgroundColor: isRecording ? '#e74c3c' : '#95a5a6' }]} />
          <Text style={StartMeetingScreenStyles.statusText}>
            {isRecording ? 'Recording in progress...' : 'Ready to record'}
          </Text>
        </View>

        <View style={StartMeetingScreenStyles.buttonContainer}>
          {!isRecording ? (
            <TouchableOpacity
              style={[StartMeetingScreenStyles.button, StartMeetingScreenStyles.startButton]}
              onPress={handleStartRecording}
            >
              <Text style={StartMeetingScreenStyles.buttonText}>Start Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[StartMeetingScreenStyles.button, StartMeetingScreenStyles.stopButton]}
              onPress={handleStopRecording}
            >
              <Text style={StartMeetingScreenStyles.buttonText}>Stop Recording</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={StartMeetingScreenStyles.infoContainer}>
          <Text style={StartMeetingScreenStyles.infoTitle}>Recording Features:</Text>
          <Text style={StartMeetingScreenStyles.infoText}>• Audio transcription</Text>
          <Text style={StartMeetingScreenStyles.infoText}>• Meeting summary</Text>
          <Text style={StartMeetingScreenStyles.infoText}>• Action items extraction</Text>
          <Text style={StartMeetingScreenStyles.infoText}>• Participant tracking</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};



export default StartMeetingScreen;