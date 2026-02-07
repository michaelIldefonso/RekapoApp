import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const TermsPopup = ({ visible, onClose, isDarkMode }) => {
  const container = [styles.container, isDarkMode && styles.containerDark];
  const textStyle = [styles.text, isDarkMode && styles.textDark];
  const titleStyle = [styles.title, isDarkMode && styles.titleDark];

  return (
    <Modal animationType="slide" visible={visible} transparent={true} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay}>
          <View style={container}>
            <Text style={titleStyle}>Terms of Service</Text>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <Text style={textStyle}>
Terms of Service{"\n\n"}
Effective Date: 02/07/26{"\n\n"}
Welcome to Rekapo. By accessing or using the Rekapo mobile application (“App”), you agree to be bound by these Terms of Service (“Terms”). If you do not agree with these Terms, please do not use the App.{"\n\n"}
1. Description of the Service{"\n\n"}
Rekapo is an application that allows users to:{"\n\n"}
Record spoken conversations in Tagalog and English{"\n\n"}
Transcribe recorded audio into text{"\n\n"}
Translate transcriptions into English{"\n\n"}
Generate summarized versions of the transcribed content{"\n\n"}
The App is intended to assist with note-taking, documentation, and productivity purposes.{"\n\n"}
2. User Responsibilities{"\n\n"}
By using Rekapo, you agree that:{"\n\n"}
You will only record audio with proper consent from all parties involved{"\n\n"}
You will comply with all applicable local and national laws regarding audio recording and privacy{"\n\n"}
You are responsible for the content you record, upload, or process through the App{"\n\n"}
Rekapo is not responsible for unauthorized or illegal recordings made by users.{"\n\n"}
3. Ownership of Content{"\n\n"}
You retain ownership of your recorded audio and generated text{"\n\n"}
By using the App, you grant Rekapo a limited license to process your data solely for providing the App’s features (transcription, translation, and summarization){"\n\n"}
4. Acceptable Use{"\n\n"}
You agree not to use Rekapo to:{"\n\n"}
Violate privacy or consent laws{"\n\n"}
Record sensitive or confidential information without permission{"\n\n"}
Engage in unlawful, harmful, or abusive activities{"\n\n"}
5. Accuracy Disclaimer{"\n\n"}
While Rekapo aims to provide accurate transcription, translation, and summarization, results may not always be error-free. The App should not be relied upon as a sole source for legal, medical, or professional decisions.{"\n\n"}
6. Limitation of Liability{"\n\n"}
Rekapo shall not be liable for:{"\n\n"}
Data loss{"\n\n"}
Inaccurate transcriptions or summaries{"\n\n"}
Damages resulting from misuse of the App{"\n\n"}
Use of the App is at your own risk.{"\n\n"}
7. Service Availability{"\n\n"}
We may modify, suspend, or discontinue any part of the App at any time without prior notice.{"\n\n"}
8. Changes to the Terms{"\n\n"}
These Terms may be updated from time to time. Continued use of the App means you accept the revised Terms.{"\n\n"}
9. Contact Information{"\n\n"}
For questions or concerns, please contact us at:{"\n"}
📧 micheal04@gmail.com
              </Text>
            </ScrollView>

            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  container: { backgroundColor: 'white', borderRadius: 12, maxHeight: '85%' , padding: 16, minHeight: 220, width: '100%' },
  containerDark: { backgroundColor: '#222' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  titleDark: { color: '#fff' },
  scroll: { maxHeight: 420, marginVertical: 6 },
  scrollContent: { paddingBottom: 12 },
  text: { fontSize: 14, color: '#333', lineHeight: 20 },
  textDark: { color: '#ddd' },
  actions: { marginTop: 12, alignItems: 'center' },
  closeButton: { backgroundColor: '#3498db', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  closeButtonText: { color: 'white', fontWeight: '600' },
});

export default TermsPopup;
