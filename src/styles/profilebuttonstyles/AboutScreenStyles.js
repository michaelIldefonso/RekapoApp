import { StyleSheet } from 'react-native';

const AboutScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  creditsText: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#e74c3c',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 30,
  },
  themeToggleButtonWrapper: {
    marginTop: -7,
  },
});

export default AboutScreenStyles;
