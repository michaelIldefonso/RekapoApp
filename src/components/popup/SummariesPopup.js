import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import SummariesPopupStyles from '../../styles/popupstyles/SummariesPopupStyles';

const SummariesPopup = ({ visible, summaries, isDarkMode, onClose }) => {
  const containerStyle = [
    SummariesPopupStyles.container,
    isDarkMode && { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  ];

  const popupStyle = [
    SummariesPopupStyles.popup,
    isDarkMode && { backgroundColor: '#333' },
  ];

  const headerStyle = [
    SummariesPopupStyles.header,
    isDarkMode && { backgroundColor: '#444', borderBottomColor: '#555' },
  ];

  const titleStyle = [
    SummariesPopupStyles.title,
    isDarkMode && { color: '#fff' },
  ];

  const closeButtonStyle = [
    SummariesPopupStyles.closeButton,
    isDarkMode && { backgroundColor: '#555' },
  ];

  const closeButtonTextStyle = [
    SummariesPopupStyles.closeButtonText,
    isDarkMode && { color: '#fff' },
  ];

  const summaryItemStyle = [
    SummariesPopupStyles.summaryItem,
    isDarkMode && { backgroundColor: '#444', borderColor: '#555' },
  ];

  const summaryTitleStyle = [
    SummariesPopupStyles.summaryTitle,
    isDarkMode && { color: '#fff' },
  ];

  const summaryTextStyle = [
    SummariesPopupStyles.summaryText,
    isDarkMode && { color: '#ddd' },
  ];

  const emptyMessageStyle = [
    SummariesPopupStyles.emptyMessage,
    isDarkMode && { color: '#aaa' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={containerStyle}>
        <View style={popupStyle}>
          {/* Header */}
          <View style={headerStyle}>
            <Text style={titleStyle}>📝 All Summaries</Text>
            <TouchableOpacity style={closeButtonStyle} onPress={onClose}>
              <Text style={closeButtonTextStyle}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Summaries List */}
          <ScrollView style={SummariesPopupStyles.scrollContainer}>
            {summaries.length > 0 ? (
              summaries.map((summary, index) => (
                <View key={index} style={summaryItemStyle}>
                  <Text style={summaryTitleStyle}>
                    Summary {index + 1}
                  </Text>
                  <Text style={summaryTextStyle}>{summary.text}</Text>
                </View>
              ))
            ) : (
              <Text style={emptyMessageStyle}>No summaries yet. Waiting for transcriptions...</Text>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[
            SummariesPopupStyles.footer,
            isDarkMode && { backgroundColor: '#444', borderTopColor: '#555' }
          ]}>
            <TouchableOpacity 
              style={[
                SummariesPopupStyles.closeButton,
                { flex: 1, marginTop: 0 }
              ]}
              onPress={onClose}
            >
              <Text style={closeButtonTextStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SummariesPopup;
