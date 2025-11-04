import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import LogoutPopupStyles from '../../styles/popupstyles/LogoutPopupStyles';

const LogoutPopup = ({ visible, onConfirm, onCancel, isDarkMode }) => {
  const overlayStyle = [
    LogoutPopupStyles.overlay,
    isDarkMode && { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  ];
  
  const popupStyle = [
    LogoutPopupStyles.popup,
    isDarkMode && { 
      backgroundColor: '#333',
      borderColor: '#e1e8ed',
    },
  ];
  
  const titleStyle = [
    LogoutPopupStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  
  const messageStyle = [
    LogoutPopupStyles.message,
    isDarkMode && { color: '#bbb' },
  ];

  const cancelButtonStyle = [
    LogoutPopupStyles.cancelButton,
    isDarkMode && { 
      backgroundColor: '#2c2c2c',
      borderColor: '#555',
    },
  ];

  const cancelButtonTextStyle = [
    LogoutPopupStyles.cancelButtonText,
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
          <Text style={titleStyle}>Logout</Text>
          <Text style={messageStyle}>
            Are you sure you want to logout?
          </Text>
          <View style={LogoutPopupStyles.buttonRow}>
            <TouchableOpacity 
              style={cancelButtonStyle}
              onPress={onCancel}
            >
              <Text style={cancelButtonTextStyle}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={LogoutPopupStyles.logoutButton}
              onPress={onConfirm}
            >
              <Text style={LogoutPopupStyles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default LogoutPopup;
