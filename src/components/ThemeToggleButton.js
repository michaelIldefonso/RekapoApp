import React from 'react';
import { TouchableOpacity } from 'react-native';
import ThemeToggleButtonStyles from '../styles/componentstyles/ThemeToggleButtonStyles';
import { Ionicons } from '@expo/vector-icons';

/**
 * ThemeToggleButton
 * Button to toggle between light and dark mode.
 * Props:
 *   - isDarkMode: boolean, current theme mode
 *   - onToggle: function, called when button is pressed
 */

const ThemeToggleButton = ({ isDarkMode, onToggle }) => (
  <TouchableOpacity
    style={[
      ThemeToggleButtonStyles.button,
      { backgroundColor: 'transparent', borderWidth: 0, shadowOpacity: 0, elevation: 0 }, // keep button background transparent
    ]}
    onPress={onToggle}
  >
    {/* Icon changes based on theme */}
    <Ionicons
      name={isDarkMode ? 'sunny' : 'moon'}
      size={22}
      color={isDarkMode ? '#f1c40f' : '#34495e'}
    />
  </TouchableOpacity>
);

export default ThemeToggleButton;
