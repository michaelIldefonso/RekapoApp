// API Utility for making authenticated requests to backend
import { getStoredToken } from './authService';
import config from '../config/app.config';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/users/profile')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} body - Request body for POST/PUT requests
 * @returns {Promise} Response data
 */
export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  try {
    const token = await getStoredToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${config.BACKEND_URL}/api${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      // Try to get detailed error message from backend
      const errorMsg = data.detail || data.message || JSON.stringify(data) || 'API request failed';
      console.error('API Error Response:', data);
      throw new Error(errorMsg);
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Example API calls

export const getUserProfile = async () => {
  return await apiRequest('/auth/me', 'GET');
};

export const updateUsername = async (username) => {
  console.log('📝 Updating username to:', username);
  console.log('📤 Request body:', { username });
  return await apiRequest('/users/me/username', 'PATCH', { username });
};

export const uploadProfilePhoto = async (imageUri) => {
  try {
    const token = await getStoredToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('📤 Uploading photo from URI:', imageUri);
    
    const formData = new FormData();
    
    // Add profile picture file
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });

    console.log('📦 FormData prepared, sending to backend...');

    const response = await fetch(`${config.BACKEND_URL}/api/users/me/photo`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    console.log('📥 Backend response status:', response.status);
    console.log('📥 Backend response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to upload photo');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Photo Upload Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteProfilePhoto = async () => {
  return await apiRequest('/users/me/photo', 'DELETE');
};

// Legacy function - keeping for backward compatibility
export const updateUserProfile = async (profileData) => {
  // Deprecated: Use updateUsername() or uploadProfilePhoto() instead
  if (profileData.username) {
    return await updateUsername(profileData.username);
  }
  if (profileData.profile_picture) {
    return await uploadProfilePhoto(profileData.profile_picture);
  }
  throw new Error('No valid profile data provided');
};

export const createMeetingSession = async (meetingData) => {
  return await apiRequest('/meetings', 'POST', meetingData);
};

export const getMeetingSessions = async () => {
  return await apiRequest('/meetings', 'GET');
};

export const getMeetingById = async (meetingId) => {
  return await apiRequest(`/meetings/${meetingId}`, 'GET');
};

export const updateUserConsent = async (dataUsageConsent) => {
  return await apiRequest('/users/me/consent', 'PATCH', { 
    data_usage_consent: dataUsageConsent 
  });
};
