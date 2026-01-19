import { StyleSheet } from 'react-native';

const StartRecordStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  miniStatusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusIndicatorRecording: {
    backgroundColor: '#e74c3c',
  },
  statusIndicatorIdle: {
    backgroundColor: '#95a5a6',
  },
  statusText: {
    fontSize: 12,
    color: '#555',
    marginRight: 10,
  },
  buttonContainer: {
    display: 'none',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Main transcription area - takes up most of the screen
  transcriptionContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 0,
  },
  transcriptionTitle: {
    display: 'none',
  },
  transcriptionScroll: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  transcriptionItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  segmentNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
  },
  transcriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  translationText: {
    fontSize: 13,
    color: '#4CAF50',
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 4,
  },
  
  // Summary container - can be smaller or in a modal
  summaryContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    maxHeight: 150,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryItem: {
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  summaryRange: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  
  // Minimal theme toggle
  themeToggleButtonWrapper: {
    alignSelf: 'center',
    marginTop: -26,
  },
});

export default StartRecordStyles;
