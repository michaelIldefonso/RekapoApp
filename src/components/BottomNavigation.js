/**
 * BottomNavigation.js — Bottom Tab Bar Component
 *
 * Renders a persistent bottom navigation bar with 4 tabs:
 *   Home (🏠), History (📋), Record (🎤️), Profile (👤)
 *
 * Features:
 *   - Highlights the currently active tab
 *   - Supports dark mode theming
 *   - Respects navigation lock: when recording is active, other tabs
 *     appear dimmed (opacity 0.45) and tapping them triggers a lock alert
 *     in App.js instead of navigating
 *
 * Props:
 *   - activeScreen: which tab is currently active
 *   - onNavigate: function to change screens (goes through App.js handleNavigate)
 *   - isDarkMode: current theme
 *   - navigationLocked: whether navigation is locked (recording in progress)
 *   - lockedScreen: which screen holds the lock (e.g., 'StartRecord')
 */
import React from 'react';

import { View, TouchableOpacity, Text } from 'react-native';
import BottomNavigationStyles from '../styles/componentstyles/BottomNavigationStyles';

const BottomNavigation = ({ activeScreen, onNavigate, isDarkMode, navigationLocked = false, lockedScreen = null }) => {
  // Define the 4 navigation tabs and their display labels/icons
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
      {navItems.map((item) => {
        const isLockedOut = navigationLocked && lockedScreen && lockedScreen !== item.key;
        return (
        <TouchableOpacity
          key={item.key}
          style={[
            navItemStyle,
            activeScreen === item.key && activeNavItemStyle,
            isLockedOut && { opacity: 0.45 },
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
        );
      })}
    </View>
  );
};



export default BottomNavigation;