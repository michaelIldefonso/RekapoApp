import { StyleSheet } from 'react-native';

const PhotoOptionsPopupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
    gap: 10,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f5f8fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    borderColor: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    marginTop: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  deleteText: {
    color: '#FF3B30',
  },
  cancelText: {
    color: '#666',
  },
});

export default PhotoOptionsPopupStyles;
