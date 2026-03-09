/**
 * PhotoOptionsPopup.js — Profile Photo Action Sheet
 *
 * Presents options for changing the profile photo:
 *   - Take Photo (opens device camera)
 *   - Choose from Gallery (opens image picker)
 *   - Delete Photo (removes current photo)
 *   - Cancel
 *
 * Uses expo-image-picker for camera and gallery access.
 */
import React from 'react';

import { Modal, View, Text, TouchableOpacity } from 'react-native';
import PhotoOptionsPopupStyles from '../../styles/popupstyles/PhotoOptionsPopupStyles';

const PhotoOptionsPopup = ({ visible, onTakePhoto, onChooseGallery, onDelete, onCancel, isDarkMode }) => {
  const overlayStyle = [
    PhotoOptionsPopupStyles.overlay,
    isDarkMode && { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  ];
  
  const popupStyle = [
    PhotoOptionsPopupStyles.popup,
    isDarkMode && { 
      backgroundColor: '#333',
      borderColor: '#e1e8ed',
    },
  ];
  
  const titleStyle = [
    PhotoOptionsPopupStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  
  const subtitleStyle = [
    PhotoOptionsPopupStyles.subtitle,
    isDarkMode && { color: '#bbb' },
  ];

  const optionButtonStyle = [
    PhotoOptionsPopupStyles.optionButton,
    isDarkMode && { 
      backgroundColor: '#2c2c2c',
      borderColor: '#555',
    },
  ];

  const deleteButtonStyle = [
    PhotoOptionsPopupStyles.optionButton,
    PhotoOptionsPopupStyles.deleteButton,
    isDarkMode && { 
      backgroundColor: '#4a1a1a',
      borderColor: '#FF3B30',
    },
  ];

  const cancelButtonStyle = [
    PhotoOptionsPopupStyles.optionButton,
    PhotoOptionsPopupStyles.cancelButton,
    isDarkMode && { 
      backgroundColor: '#2c2c2c',
      borderColor: '#555',
    },
  ];

  const optionTextStyle = [
    PhotoOptionsPopupStyles.optionText,
    isDarkMode && { color: '#fff' },
  ];

  const cancelTextStyle = [
    PhotoOptionsPopupStyles.optionText,
    PhotoOptionsPopupStyles.cancelText,
    isDarkMode && { color: '#bbb' },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity 
        style={overlayStyle} 
        activeOpacity={1} 
        onPress={onCancel}
      >
        <View style={popupStyle}>
          <Text style={titleStyle}>Change Profile Photo</Text>
          <Text style={subtitleStyle}>Choose an option</Text>
          
          <View style={PhotoOptionsPopupStyles.optionsContainer}>
            <TouchableOpacity 
              style={optionButtonStyle}
              onPress={onTakePhoto}
            >
              <Text style={optionTextStyle}>📷 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={optionButtonStyle}
              onPress={onChooseGallery}
            >
              <Text style={optionTextStyle}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={deleteButtonStyle}
              onPress={onDelete}
            >
              <Text style={[optionTextStyle, PhotoOptionsPopupStyles.deleteText]}>🗑️ Delete Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={cancelButtonStyle}
              onPress={onCancel}
            >
              <Text style={cancelTextStyle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default PhotoOptionsPopup;
