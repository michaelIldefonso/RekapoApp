import { StyleSheet } from 'react-native';

const LoginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoText: {
    fontSize: 64,
    marginBottom: 8,
    alignSelf: 'center',
    marginTop: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7f8c8d',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 0,
    color: '#2c3e50',
  },
  loginContainer: {
     justifyContent: 'flex-start',
    paddingVertical: 40,
    marginTop: 0,
  },
  googleButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#4285f4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e8ed',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#7f8c8d',
  },
  emailButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#7f8c8d',
    lineHeight: 18,
  },
  linkText: {
    color: '#3498db',
    fontWeight: '500',
  },
  topRightButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 10,
  },
});

export default LoginScreenStyles;
