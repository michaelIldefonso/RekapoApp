import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import WelcomePopupStyles from '../styles/popupstyles/WelcomePopupStyles';

const WelcomePopup = ({ visible, userName, onClose, isDarkMode }) => {
  const overlayStyle = [
    WelcomePopupStyles.overlay,
    isDarkMode && { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  ];
  
  const popupStyle = [
    WelcomePopupStyles.popup,
    isDarkMode && { 
      backgroundColor: '#333',
      borderColor: '#e1e8ed',
    },
  ];
  
  const titleStyle = [
    WelcomePopupStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  
  const messageStyle = [
    WelcomePopupStyles.message,
    isDarkMode && { color: '#bbb' },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={overlayStyle} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={popupStyle}>
          <Text style={titleStyle}>Success</Text>
          <Text style={messageStyle}>
            Welcome {userName}!
          </Text>
          <TouchableOpacity 
            style={WelcomePopupStyles.button}
            onPress={onClose}
          >
            <Text style={WelcomePopupStyles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default WelcomePopup;
