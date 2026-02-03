import { StyleSheet } from 'react-native';

const MainScreenStyles = StyleSheet.create({
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
  cardContainer: {
    gap: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  appDescriptionStyle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 20,
  },
  heroCard: {
    backgroundColor: '#f5f9ff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 24,
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 12,
    lineHeight: 32,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: '#2c3e50',
    marginBottom: 12,
    fontWeight: '500',
  },
  heroSubtext: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 8,
    marginBottom: 0,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  featureBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureBoxAlt: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  featureSubtext: {
    fontSize: 13,
    marginTop: 4,
    color: '#666',
  },
  featureArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#7f8c8d',
    marginTop: 0,
    marginBottom: 0,
  },
  themeToggleButtonWrapper: {
    marginTop: -7,
  },
  
  // Dark mode overrides
  containerDark: {
    backgroundColor: '#222',
  },
  titleDark: {
    color: '#ffffffff',
  },
  subtitleDark: {
    color: '#ffffffff',
  },
  cardDark: {
    backgroundColor: '#333333',
    borderColor: '#444444',
    borderWidth: 1,
    shadowOpacity: 0.2,
  },
  cardTitleDark: {
    color: '#fff',
  },
  cardDescriptionDark: {
    color: '#bbb',
  },
  appDescriptionDark: {
    color: '#bbb',
  },
  heroCardDark: {
    backgroundColor: '#2a2a2a',
    shadowOpacity: 0.15,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  featureBoxDark: {
    backgroundColor: '#2a2a2a',
  },
  featureTextDark: {
    color: '#fff',
  },
  featureSubtextDark: {
    color: '#aaa',
  },
  featureArrowDark: {
    color: '#666',
  },
  infoCardDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  infoTitleDark: {
    color: '#fff',
  },
  infoTextDark: {
    color: '#bbb',
  },
});

export default MainScreenStyles;
