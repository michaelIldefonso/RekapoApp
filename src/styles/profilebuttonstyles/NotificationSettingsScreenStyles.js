import { StyleSheet } from 'react-native';

const NotificationSettingsScreenStyles = StyleSheet.create({
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
  themeToggleButtonWrapper: {
    marginTop: -7,
  },
});

export default NotificationSettingsScreenStyles;
