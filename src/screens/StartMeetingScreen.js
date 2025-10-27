import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Start New Meeting</Text>
        <Text style={styles.subtitle}>Set up your recording session</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Meeting Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter meeting title..."
            value={meetingTitle}
            onChangeText={setMeetingTitle}
            editable={!isRecording}
          />
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: isRecording ? '#e74c3c' : '#95a5a6' }]} />
          <Text style={styles.statusText}>
            {isRecording ? 'Recording in progress...' : 'Ready to record'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {!isRecording ? (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleStartRecording}
            >
              <Text style={styles.buttonText}>Start Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStopRecording}
            >
              <Text style={styles.buttonText}>Stop Recording</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Recording Features:</Text>
          <Text style={styles.infoText}>• Audio transcription</Text>
          <Text style={styles.infoText}>• Meeting summary</Text>
          <Text style={styles.infoText}>• Action items extraction</Text>
          <Text style={styles.infoText}>• Participant tracking</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#27ae60',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
});

export default StartMeetingScreen;