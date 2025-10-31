import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AccountSettingsScreenStyles from '../../styles/profilebuttonstyles/AccountSettingsScreenStyles';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { getStoredUser } from '../../services/authService';
import { updateUsername, uploadProfilePhoto, deleteProfilePhoto } from '../../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config/app.config';

const AccountSettingsScreen = ({ isDarkMode, onToggleDarkMode, onNavigate }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());

  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    // Request camera and media library permissions
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      console.log('Camera or media library permissions not granted');
    }
  };

  const loadUserData = async () => {
    try {
      const user = await getStoredUser();
      if (user) {
        // Fix malformed photo URLs in stored data
        if (user.profile_picture_path && user.profile_picture_path.includes('8000uploads')) {
          console.log('🔧 Fixing malformed URL in stored data');
          user.profile_picture_path = user.profile_picture_path.replace('8000uploads', '8000/uploads');
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
        }
        setUserInfo(user);
        setUsername(user.username || user.name || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => takePhoto(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage(),
        },
        {
          text: 'Delete Photo',
          onPress: () => handleDeletePhoto(),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadPhoto = async (imageUri) => {
    setIsSaving(true);
    try {
      console.log('📸 Uploading photo:', imageUri);
      
      // Optimistically update UI with local image
      setUserInfo(prev => ({
        ...prev,
        profile_picture_path: imageUri
      }));
      
      // Call API to upload photo
      const result = await uploadProfilePhoto(imageUri);
      
      console.log('📤 Upload result:', result);
      
      if (result.success) {
        // Get photo path from backend response
        let backendPhotoPath = result.data.profile_picture_path || result.data.file_path || imageUri;
        console.log('📍 Backend photo path:', backendPhotoPath);
        
        // If it's a relative path, construct full URL
        if (backendPhotoPath && !backendPhotoPath.startsWith('http')) {
          // Remove /api from BACKEND_URL for uploads
          const baseUrl = config.BACKEND_URL.replace('/api', '');
          // Ensure there's a slash between baseUrl and path
          const separator = backendPhotoPath.startsWith('/') ? '' : '/';
          backendPhotoPath = `${baseUrl}${separator}${backendPhotoPath}`;
          console.log('🔗 Full photo URL:', backendPhotoPath);
        }
        
        const updatedUser = { 
          ...userInfo, 
          profile_picture_path: backendPhotoPath
        };
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        setUserInfo(updatedUser);
        setImageRefreshKey(Date.now()); // Force image refresh
        console.log('🎨 UI updated with new photo:', backendPhotoPath);
        Alert.alert('Success', 'Profile photo updated successfully!');
      } else {
        console.error('❌ Upload failed:', result.error);
        // Revert to original photo on error
        await loadUserData();
        Alert.alert('Error', result.error || 'Failed to update photo');
      }
    } catch (error) {
      console.error('💥 Error uploading photo:', error);
      // Revert to original photo on error
      await loadUserData();
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhoto = async () => {
    Alert.alert(
      'Delete Profile Photo',
      'Are you sure you want to delete your profile photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              const result = await deleteProfilePhoto();
              
              if (result.success) {
                // Remove photo from local storage
                const updatedUser = { ...userInfo, profile_picture_path: null };
                await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
                setUserInfo(updatedUser);
                Alert.alert('Success', 'Profile photo deleted successfully!');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete photo');
              }
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ],
    );
  };

  const handleSaveUsername = async () => {
    const trimmedUsername = username.trim();
    
    // Validate username
    if (!trimmedUsername) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    
    if (trimmedUsername.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return;
    }
    
    if (trimmedUsername.length > 50) {
      Alert.alert('Error', 'Username cannot exceed 50 characters');
      return;
    }
    
    // Validate format (alphanumeric, underscore, hyphen only)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      Alert.alert('Error', 'Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setIsSaving(true);
    try {
      console.log('💾 Saving username:', trimmedUsername);
      const result = await updateUsername(trimmedUsername);
      
      console.log('✅ Update result:', result);
      
      if (result.success) {
        // Update local storage with new username from backend response
        const updatedUser = { 
          ...userInfo, 
          username: result.data.username || trimmedUsername 
        };
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        setUserInfo(updatedUser);
        setIsEditingUsername(false);
        Alert.alert('Success', 'Username updated successfully!');
      } else {
        console.error('❌ Update failed:', result.error);
        Alert.alert('Error', result.error || 'Failed to update username');
      }
    } catch (error) {
      console.error('💥 Error updating username:', error);
      Alert.alert('Error', error.message || 'Failed to update username');
    } finally {
      setIsSaving(false);
    }
  };

  // Dynamic styles for dark mode
  const containerStyle = [
    AccountSettingsScreenStyles.container,
    isDarkMode && { backgroundColor: '#222' },
  ];
  const titleStyle = [
    AccountSettingsScreenStyles.title,
    isDarkMode && { color: '#fff' },
  ];
  const cardStyle = {
    backgroundColor: isDarkMode ? '#333' : '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0 : 0.1,
    shadowRadius: 4,
    elevation: isDarkMode ? 0 : 3,
  };
  const labelStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: isDarkMode ? '#bbb' : '#666',
    marginBottom: 8,
  };
  const valueStyle = {
    fontSize: 16,
    color: isDarkMode ? '#fff' : '#000',
    marginBottom: 12,
  };
  const inputStyle = {
    fontSize: 16,
    color: isDarkMode ? '#fff' : '#000',
    borderWidth: 1,
    borderColor: isDarkMode ? '#555' : '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: isDarkMode ? '#444' : '#f9f9f9',
  };
  const buttonStyle = {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  };
  const buttonTextStyle = {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  };
  const secondaryButtonStyle = {
    backgroundColor: isDarkMode ? '#555' : '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  };
  const secondaryButtonTextStyle = {
    color: isDarkMode ? '#fff' : '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  };

  if (isLoading) {
    return (
      <SafeAreaView style={containerStyle}>
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={AccountSettingsScreenStyles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={titleStyle}>Account Settings</Text>
          <View style={AccountSettingsScreenStyles.themeToggleButtonWrapper}>
            <ThemeToggleButton isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          </View>
        </View>

        {/* Profile Photo Section */}
        <View style={cardStyle}>
          <Text style={labelStyle}>Profile Photo</Text>
          <View style={{ alignItems: 'center', marginVertical: 16 }}>
            {userInfo?.profile_picture_path ? (
              <>
                <Text style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>
                  Debug: {userInfo.profile_picture_path}
                </Text>
                <Image
                  key={`${userInfo.profile_picture_path}-${imageRefreshKey}`}
                  source={{ 
                    uri: `${userInfo.profile_picture_path}?t=${imageRefreshKey}`,
                  }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    marginBottom: 16,
                    backgroundColor: '#f0f0f0',
                  }}
                  onError={(error) => {
                    console.error('❌ Image load error:', error.nativeEvent.error);
                    console.error('❌ Failed URI:', userInfo.profile_picture_path);
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully!');
                  }}
                />
              </>
            ) : (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: '#007AFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 48, color: '#fff' }}>
                  {userInfo?.name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={buttonStyle}
            onPress={handleChangePhoto}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={buttonTextStyle}>Change Photo</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Username Section */}
        <View style={cardStyle}>
          <Text style={labelStyle}>Username</Text>
          {isEditingUsername ? (
            <>
              <TextInput
                style={inputStyle}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={50}
              />
              <Text style={{ 
                fontSize: 12, 
                color: isDarkMode ? '#888' : '#999',
                marginBottom: 12 
              }}>
                3-50 characters. Letters, numbers, underscores, and hyphens only.
              </Text>
              <TouchableOpacity
                style={buttonStyle}
                onPress={handleSaveUsername}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={buttonTextStyle}>Save Username</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={secondaryButtonStyle}
                onPress={() => {
                  setIsEditingUsername(false);
                  setUsername(userInfo?.username || userInfo?.name || '');
                }}
              >
                <Text style={secondaryButtonTextStyle}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={valueStyle}>{userInfo?.username || userInfo?.name || 'Not set'}</Text>
              <TouchableOpacity
                style={buttonStyle}
                onPress={() => setIsEditingUsername(true)}
              >
                <Text style={buttonTextStyle}>Change Username</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Email Section (Read-only) */}
        <View style={cardStyle}>
          <Text style={labelStyle}>Email</Text>
          <Text style={valueStyle}>{userInfo?.email}</Text>
          <Text style={{ fontSize: 12, color: isDarkMode ? '#888' : '#999' }}>
            Email cannot be changed (linked to Google account)
          </Text>
        </View>

        {/* Google Account Section (Read-only) */}
        <View style={cardStyle}>
          <Text style={labelStyle}>Connected Account</Text>
          <Text style={valueStyle}>Google</Text>
          <Text style={{ fontSize: 12, color: isDarkMode ? '#888' : '#999' }}>
            Signed in with Google account
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountSettingsScreen;
