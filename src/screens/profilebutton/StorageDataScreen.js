import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import StorageDataScreenStyles from '../../styles/profilebuttonstyles/StorageDataScreenStyles';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import BackButton from '../../components/BackButton';

const StorageDataScreen = ({ isDarkMode, onToggleDarkMode, onNavigate }) => {
  // Dynamic styles for dark mode
  const containerStyle = [
    StorageDataScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const titleStyle = [
    StorageDataScreenStyles.title,
    isDarkMode && { color: '#fff' },
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={StorageDataScreenStyles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BackButton isDarkMode={isDarkMode} onPress={() => onNavigate('Profile')} />
            <Text style={titleStyle}>Storage & Data</Text>
          </View>
          <View style={StorageDataScreenStyles.themeToggleButtonWrapper}>
            <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          </View>
        </View>
        {/* Add your storage & data content here */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StorageDataScreen;
