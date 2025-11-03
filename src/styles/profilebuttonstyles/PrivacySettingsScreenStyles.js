import { StyleSheet } from 'react-native';

const PrivacySettingsScreenStyles = StyleSheet.create({
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
  consentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 18,
    marginTop: 24,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  consentSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

export default PrivacySettingsScreenStyles;
