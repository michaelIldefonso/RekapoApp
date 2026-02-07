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
      isDarkMode 
        ? { backgroundColor: '#333333', borderColor: '#f1c40f' }
        : { backgroundColor: '#fff', borderColor: '#3498db' },
    ]}
    onPress={onToggle}
    activeOpacity={0.7}
  >
    {/* Icon changes based on theme */}
    <Ionicons
      name={isDarkMode ? 'sunny' : 'moon'}
      size={22}
      color={isDarkMode ? '#f1c40f' : '#3498db'}
    />
  </TouchableOpacity>
);

export default ThemeToggleButton;
