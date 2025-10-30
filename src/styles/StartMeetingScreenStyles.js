import { StyleSheet } from 'react-native';

const StartMeetingScreenStyles = StyleSheet.create({
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
    marginTop: 20,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    marginRight: 10,
  },
  statusIndicatorRecording: {
    backgroundColor: '#e74c3c',
    borderRadius: 6,
  },
  statusIndicatorIdle: {
    backgroundColor: '#9c1515ff',
    borderRadius: 6,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e1e8ed',
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
  themeToggleButtonWrapper: {
    marginTop: -7,
  },
});

export default StartMeetingScreenStyles;
