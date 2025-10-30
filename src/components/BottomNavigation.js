import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import BottomNavigationStyles from '../styles/BottomNavigationStyles';

const BottomNavigation = ({ activeScreen, onNavigate }) => {
  const navItems = [
    { key: 'Main', label: 'Home', icon: '🏠' },
    { key: 'SessionHistory', label: 'History', icon: '📋' },
    { key: 'StartMeeting', label: 'Record', icon: '🎙️' },
    { key: 'Profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={BottomNavigationStyles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[
            BottomNavigationStyles.navItem,
            activeScreen === item.key && BottomNavigationStyles.activeNavItem,
          ]}
          onPress={() => onNavigate(item.key)}
        >
          <Text style={[
            BottomNavigationStyles.icon,
            activeScreen === item.key && BottomNavigationStyles.activeIcon,
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            BottomNavigationStyles.label,
            activeScreen === item.key && BottomNavigationStyles.activeLabel,
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};



export default BottomNavigation;