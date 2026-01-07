import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import DeleteSessionPopupStyles from '../../styles/popupstyles/DeleteSessionPopupStyles';

const DeleteSessionPopup = ({ visible, onConfirm, onCancel, isDarkMode, sessionTitle }) => {
  const overlayStyle = [
    DeleteSessionPopupStyles.overlay,
    isDarkMode && { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  ];
  
  const popupStyle = [
    DeleteSessionPopupStyles.popup,
    isDarkMode && { 
      backgroundColor: '#333',
      borderColor: '#e1e8ed',
    },
  ];
  
  const titleStyle = [
    DeleteSessionPopupStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  
  const messageStyle = [
    DeleteSessionPopupStyles.message,
    isDarkMode && { color: '#bbb' },
  ];

  const sessionTitleStyle = [
    DeleteSessionPopupStyles.sessionTitle,
    isDarkMode && { color: '#ff6b6b' },
  ];

  const cancelButtonStyle = [
    DeleteSessionPopupStyles.cancelButton,
    isDarkMode && { 
      backgroundColor: '#2c2c2c',
      borderColor: '#555',
    },
  ];

  const cancelButtonTextStyle = [
    DeleteSessionPopupStyles.cancelButtonText,
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
        <TouchableOpacity activeOpacity={1}>
          <View style={popupStyle}>
            <Text style={titleStyle}>Delete Session</Text>
            <Text style={messageStyle}>
              Are you sure you want to delete
            </Text>
            <Text style={sessionTitleStyle}>"{sessionTitle}"?</Text>
            <Text style={messageStyle}>
              This action cannot be undone.
            </Text>
            <View style={DeleteSessionPopupStyles.buttonRow}>
              <TouchableOpacity 
                style={cancelButtonStyle}
                onPress={onCancel}
              >
                <Text style={cancelButtonTextStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={DeleteSessionPopupStyles.deleteButton}
                onPress={onConfirm}
              >
                <Text style={DeleteSessionPopupStyles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default DeleteSessionPopup;
