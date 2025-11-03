import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredUser } from '../services/authService';
import { updateUsername, uploadProfilePhoto, deleteProfilePhoto } from '../services/apiService';
import config from '../config/app.config';

export const useAccountSettings = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  
  // Popup callbacks
  const [showPhotoOptionsCallback, setShowPhotoOptionsCallback] = useState(null);
  const [showDeletePhotoCallback, setShowDeletePhotoCallback] = useState(null);
  const [showMessageCallback, setShowMessageCallback] = useState(null);

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
    if (showPhotoOptionsCallback) {
      showPhotoOptionsCallback();
    }
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
      if (showMessageCallback) {
        showMessageCallback('Error', 'Failed to take photo');
      }
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
      if (showMessageCallback) {
        showMessageCallback('Error', 'Failed to pick image');
      }
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
        if (showMessageCallback) {
          showMessageCallback('Success', 'Profile photo updated successfully!');
        }
      } else {
        console.error('❌ Upload failed:', result.error);
        // Revert to original photo on error
        await loadUserData();
        if (showMessageCallback) {
          showMessageCallback('Error', result.error || 'Failed to update photo');
        }
      }
    } catch (error) {
      console.error('💥 Error uploading photo:', error);
      // Revert to original photo on error
      await loadUserData();
      if (showMessageCallback) {
        showMessageCallback('Error', 'Failed to upload photo');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (showDeletePhotoCallback) {
      showDeletePhotoCallback();
    }
  };

  const confirmDeletePhoto = async () => {
    setIsSaving(true);
    try {
      const result = await deleteProfilePhoto();
      
      if (result.success) {
        // Remove photo from local storage
        const updatedUser = { ...userInfo, profile_picture_path: null };
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        setUserInfo(updatedUser);
        if (showMessageCallback) {
          showMessageCallback('Success', 'Profile photo deleted successfully!');
        }
      } else {
        if (showMessageCallback) {
          showMessageCallback('Error', result.error || 'Failed to delete photo');
        }
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      if (showMessageCallback) {
        showMessageCallback('Error', 'Failed to delete photo');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUsername = async () => {
    const trimmedUsername = username.trim();
    
    // Validate username
    if (!trimmedUsername) {
      if (showMessageCallback) {
        showMessageCallback('Error', 'Username cannot be empty');
      }
      return;
    }
    
    if (trimmedUsername.length < 3) {
      if (showMessageCallback) {
        showMessageCallback('Error', 'Username must be at least 3 characters long');
      }
      return;
    }
    
    if (trimmedUsername.length > 50) {
      if (showMessageCallback) {
        showMessageCallback('Error', 'Username cannot exceed 50 characters');
      }
      return;
    }
    
    // Validate format (alphanumeric, underscore, hyphen only)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      if (showMessageCallback) {
        showMessageCallback('Error', 'Username can only contain letters, numbers, underscores, and hyphens');
      }
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
        if (showMessageCallback) {
          showMessageCallback('Success', 'Username updated successfully!');
        }
      } else {
        console.error('❌ Update failed:', result.error);
        if (showMessageCallback) {
          showMessageCallback('Error', result.error || 'Failed to update username');
        }
      }
    } catch (error) {
      console.error('💥 Error updating username:', error);
      if (showMessageCallback) {
        showMessageCallback('Error', error.message || 'Failed to update username');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
    userInfo,
    username,
    setUsername,
    isEditingUsername,
    setIsEditingUsername,
    isLoading,
    isSaving,
    imageRefreshKey,
    handleChangePhoto,
    handleSaveUsername,
    takePhoto,
    pickImage,
    handleDeletePhoto,
    confirmDeletePhoto,
    setShowPhotoOptionsCallback,
    setShowDeletePhotoCallback,
    setShowMessageCallback,
  };
};
