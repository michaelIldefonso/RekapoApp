import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const PrivacyPopup = ({ visible, onClose, isDarkMode }) => {
  const container = [styles.container, isDarkMode && styles.containerDark];
  const textStyle = [styles.text, isDarkMode && styles.textDark];
  const titleStyle = [styles.title, isDarkMode && styles.titleDark];

  return (
    <Modal animationType="slide" visible={visible} transparent={true} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay}>
          <View style={container}>
            <Text style={titleStyle}>Privacy Policy</Text>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <Text style={textStyle}>
Privacy Policy{"\n\n"}
Effective Date: 02/07/26{"\n\n"}
Rekapo values your privacy. This Privacy Policy explains how we collect, use, and protect your information.{"\n\n"}
1. Information We Collect{"\n\n"}
Rekapo may collect the following data:{"\n\n"}
Audio recordings created by the user{"\n\n"}
Transcribed text, translated text, and summaries{"\n\n"}
Technical logs including error reports, app performance data, and usage patterns{"\n\n"}
Device information and app version for technical support{"\n\n"}
2. How We Use Your Information{"\n\n"}
Your data is used solely to:{"\n\n"}
Provide transcription, translation, and summarization services{"\n\n"}
Improve app accuracy and functionality{"\n\n"}
Maintain app security and performance{"\n\n"}
We do not sell or rent user data to third parties.{"\n\n"}
3. Audio and Text Data Handling{"\n\n"}
Audio recordings and generated text are processed only to deliver app features{"\n\n"}
Data is stored securely and accessed only when necessary for system operations{"\n\n"}
Users may delete their recordings and data within the App{"\n\n"}
4. Technical Logs and Diagnostics{"\n\n"}
To maintain app quality and fix issues, we collect technical logs including:{"\n\n"}
Error messages and crash reports{"\n\n"}
App performance metrics{"\n\n"}
Feature usage patterns (no personal content){"\n\n"}
These logs are automatically sent to our servers for analysis and debugging. Logs are retained for 30 days and do not contain sensitive personal information. This data collection is necessary for providing a reliable service.{"\n\n"}
5. Data Sharing{"\n\n"}
We do not share personal data except:{"\n\n"}
When required by law{"\n\n"}
To protect the rights and safety of users or the system{"\n\n"}
5. Data Security{"\n\n"}
We implement reasonable technical and organizational measures to protect user data from unauthorized access, loss, or misuse.{"\n\n"}
6. Machine Learning & Training Data (Optional){"\n\n"}
8o improve the accuracy of transcription, translation, and summarization services, Rekapo may use anonymized recordings and text data to train and refine AI models.{"\n\n"}
Training data consent is OPTIONAL:{"\n\n"}
You can enable or disable training data usage at any time in Profile → Privacy Settings{"\n\n"}
When enabled, your data may be used to improve AI models (anonymized){"\n\n"}
When disabled, your data is used only for providing immediate services to you{"\n\n"}
The core functionality of Rekapo works regardless of your training consent preference{"\n\n"}
7. User Consent{"\n\n"}
By using Rekapo, you consent to the collection and processing of your data as described in this Privacy Policy.{"\n\n"}
9. User Rights{"\n\n"}
Users have the right to:{"\n\n"}
Access their data{"\n\n"}
Request deletion of stored data{"\n\n"}
Control training data consent preferences{"\n\n"}
Stop using the App at any time{"\n\n"}
10. Children's Privacy{"\n\n"}
Rekapo is not intended for users under the age of 13. We do not knowingly collect data from children.{"\n\n"}
11. Changes to This Policy{"\n\n"}
This Privacy Policy may be updated. Continued use of the App indicates acceptance of the updated policy.{"\n\n"}
12. Contact Us{"\n\n"}
If you have questions about this Privacy Policy, contact us at:{"\n"}
📧 michaelildefonso8@gmail.com
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

export default PrivacyPopup;
