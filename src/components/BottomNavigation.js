import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import BottomNavigationStyles from '../styles/components/BottomNavigationStyles';

const BottomNavigation = ({ activeScreen, onNavigate, isDarkMode }) => {
  const navItems = [
    { key: 'Main', label: 'Home', icon: '🏠' },
    { key: 'SessionHistory', label: 'History', icon: '📋' },
    { key: 'StartMeeting', label: 'Record', icon: '🎙️' },
    { key: 'Profile', label: 'Profile', icon: '👤' },
  ];

  // Dynamic styles for dark mode
  const containerStyle = [
    BottomNavigationStyles.container,
    isDarkMode && { backgroundColor: '#232323', borderTopColor: '#444', shadowColor: '#000' },
  ];
  const navItemStyle = [
    BottomNavigationStyles.navItem,
    isDarkMode && { backgroundColor: 'transparent' },
  ];
  const activeNavItemStyle = [
    BottomNavigationStyles.activeNavItem,
    isDarkMode && { backgroundColor: '#333' },
  ];
  const iconStyle = [
    BottomNavigationStyles.icon,
    isDarkMode && { color: '#bbb' },
  ];
  const activeIconStyle = [
    BottomNavigationStyles.activeIcon,
    isDarkMode && { color: '#fff' },
  ];
  const labelStyle = [
    BottomNavigationStyles.label,
    isDarkMode && { color: '#bbb' },
  ];
  const activeLabelStyle = [
    BottomNavigationStyles.activeLabel,
    isDarkMode && { color: '#fff' },
  ];

  return (
    <View style={containerStyle}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[
            navItemStyle,
            activeScreen === item.key && activeNavItemStyle,
          ]}
          onPress={() => onNavigate(item.key)}
        >
          <Text style={[
            iconStyle,
            activeScreen === item.key && activeIconStyle,
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            labelStyle,
            activeScreen === item.key && activeLabelStyle,
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};



export default BottomNavigation;