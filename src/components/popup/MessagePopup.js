import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import MessagePopupStyles from '../../styles/popupstyles/MessagePopupStyles';

const MessagePopup = ({ visible, title, message, onClose, isDarkMode }) => {
  // Ensure title and message are always strings
  const titleText = String(title || '');
  const messageText = String(message || '');
  
  const overlayStyle = [
    MessagePopupStyles.overlay,
    isDarkMode && { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  ];
  
  const popupStyle = [
    MessagePopupStyles.popup,
    isDarkMode && { 
      backgroundColor: '#333',
      borderColor: '#e1e8ed',
    },
  ];
  
  const titleStyle = [
    MessagePopupStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  
  const messageStyle = [
    MessagePopupStyles.message,
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
          <Text style={titleStyle}>{titleText}</Text>
          <Text style={messageStyle}>{messageText}</Text>
          <TouchableOpacity 
            style={MessagePopupStyles.button}
            onPress={onClose}
          >
            <Text style={MessagePopupStyles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default MessagePopup;
