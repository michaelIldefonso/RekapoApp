import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import DeletePhotoPopupStyles from '../../styles/popupstyles/DeletePhotoPopupStyles';

const DeletePhotoPopup = ({ visible, onConfirm, onCancel, isDarkMode }) => {
  const overlayStyle = [
    DeletePhotoPopupStyles.overlay,
    isDarkMode && { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  ];
  
  const popupStyle = [
    DeletePhotoPopupStyles.popup,
    isDarkMode && { 
      backgroundColor: '#333',
      borderColor: '#e1e8ed',
    },
  ];
  
  const titleStyle = [
    DeletePhotoPopupStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  
  const messageStyle = [
    DeletePhotoPopupStyles.message,
    isDarkMode && { color: '#bbb' },
  ];

  const cancelButtonStyle = [
    DeletePhotoPopupStyles.cancelButton,
    isDarkMode && { 
      backgroundColor: '#2c2c2c',
      borderColor: '#555',
    },
  ];

  const cancelButtonTextStyle = [
    DeletePhotoPopupStyles.cancelButtonText,
    isDarkMode && { color: '#fff' },
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
          <Text style={titleStyle}>Delete Profile Photo</Text>
          <Text style={messageStyle}>
            Are you sure you want to delete your profile photo?
          </Text>
          <View style={DeletePhotoPopupStyles.buttonRow}>
            <TouchableOpacity 
              style={cancelButtonStyle}
              onPress={onCancel}
            >
              <Text style={cancelButtonTextStyle}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={DeletePhotoPopupStyles.deleteButton}
              onPress={onConfirm}
            >
              <Text style={DeletePhotoPopupStyles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default DeletePhotoPopup;
