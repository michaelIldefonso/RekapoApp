import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const BottomNavigation = ({ activeScreen, onNavigate }) => {
  const navItems = [
    { key: 'Main', label: 'Home', icon: '🏠' },
    { key: 'SessionHistory', label: 'History', icon: '📋' },
    { key: 'StartMeeting', label: 'Record', icon: '🎙️' },
    { key: 'Profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.navItem,
            activeScreen === item.key && styles.activeNavItem,
          ]}
          onPress={() => onNavigate(item.key)}
        >
          <Text style={[
            styles.icon,
            activeScreen === item.key && styles.activeIcon,
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            styles.label,
            activeScreen === item.key && styles.activeLabel,
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  activeNavItem: {
    backgroundColor: '#e3f2fd',
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default BottomNavigation;