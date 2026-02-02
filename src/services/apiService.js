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
        'Bypass-Tunnel-Reminder': '112.201.180.148',
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
        'Bypass-Tunnel-Reminder': '112.201.180.148',
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

// Session Management APIs
export const createMeetingSession = async (sessionData) => {
  // Backend expects: { session_title?: string }
  return await apiRequest('/sessions', 'POST', {
    session_title: sessionData.title || sessionData.session_title || 'Untitled Meeting'
  });
};

export const getMeetingSessions = async (skip = 0, limit = 50) => {
  return await apiRequest(`/sessions?skip=${skip}&limit=${limit}`, 'GET');
};

export const getMeetingById = async (sessionId) => {
  return await apiRequest(`/sessions/${sessionId}`, 'GET');
};

export const updateMeetingSession = async (sessionId, updateData) => {
  // Backend expects: { session_title?: string, status?: string, end_time?: string }
  return await apiRequest(`/sessions/${sessionId}`, 'PATCH', updateData);
};

export const deleteMeetingSession = async (sessionId) => {
  return await apiRequest(`/sessions/${sessionId}`, 'DELETE');
};

export const updateUserConsent = async (dataUsageConsent) => {
  return await apiRequest('/users/me/consent', 'PATCH', { 
    data_usage_consent: dataUsageConsent 
  });
};

// Session History APIs

/**
 * Get all sessions for the authenticated user
 * @param {number} skip - Number of sessions to skip for pagination (default: 0)
 * @param {number} limit - Maximum number of sessions to return (default: 50, max: 100)
 * @returns {Promise} Array of session objects with basic information
 */
export const getSessionHistory = async (skip = 0, limit = 50) => {
  return await apiRequest(`/sessions?skip=${skip}&limit=${limit}`, 'GET');
};

/**
 * Get complete session details including all transcripts, translations, and summaries
 * @param {number} sessionId - The ID of the session to retrieve
 * @returns {Promise} Complete session data with recording_segments and summaries
 */
export const getSessionDetails = async (sessionId) => {
  return await apiRequest(`/sessions/${sessionId}/details`, 'GET');
};

/**
 * WebSocket connection for real-time meeting transcription
 * @param {number} sessionId - Database session ID
 * @param {function} onMessage - Callback for incoming messages
 * @param {function} onError - Callback for errors
 * @param {function} onClose - Callback for connection close
 * @returns {object} WebSocket connection with helper methods
 */
export const connectTranscriptionWebSocket = async (sessionId, onMessage, onError, onClose) => {
  const token = await getStoredToken();
  
  if (!token) {
    const error = new Error('No authentication token found');
    if (onError) onError(error);
    throw error;
  }
  
  const wsUrl = config.BACKEND_URL.replace('http', 'ws');
  // Add session_id and token as query parameters
  const fullUrl = `${wsUrl}/api/ws/transcribe?session_id=${sessionId}&token=${encodeURIComponent(token)}`;
  console.log('🔌 Connecting to WebSocket:', fullUrl.replace(token, 'TOKEN_HIDDEN'));
  console.log('📋 Session ID:', sessionId);
  
  const ws = new WebSocket(fullUrl);
  
  let segmentNumber = 0;
  
  ws.onopen = () => {
    console.log('🔌 WebSocket connected successfully');
    console.log('📊 WebSocket state:', {
      readyState: ws.readyState,
      url: ws.url,
      protocol: ws.protocol
    });
  };
  
  ws.onmessage = (event) => {
    try {
      console.log('📨 Raw message:', event.data);
      const data = JSON.parse(event.data);
      console.log('📨 Received:', data.status || data);
      if (onMessage) onMessage(data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      console.error('Raw data:', event.data);
    }
  };
  
  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
    console.error('❌ WebSocket readyState at error:', ws.readyState);
    console.error('❌ WebSocket URL:', ws.url);
    console.error('❌ Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Provide more helpful error message
    if (ws.readyState === 3) {
      console.error('⚠️ WebSocket failed to connect. Possible issues:');
      console.error('   1. Backend server may not be running');
      console.error('   2. Wrong IP address or port');
      console.error('   3. Firewall blocking the connection');
      console.error('   4. Authentication token may be invalid');
    }
    
    if (onError) onError(error);
  };
  
  ws.onclose = (event) => {
    console.log('🔌 WebSocket disconnected');
    console.log('📊 Close event:', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean
    });
    
    // Log common close codes
    if (event.code === 1000) {
      console.log('✅ Normal closure');
    } else if (event.code === 1006) {
      console.error('⚠️ Abnormal closure - connection failed or was lost');
    } else if (event.code === 1001) {
      console.log('⚠️ Going away - server or client is going offline');
    } else if (event.code === 1003) {
      console.error('⚠️ Unsupported data type');
    } else if (event.code === 1008) {
      console.error('⚠️ Policy violation');
    } else if (event.code === 1011) {
      console.error('⚠️ Server error');
    }
    
    if (onClose) onClose(event);
  };
  
  return {
    connection: ws,
    sendAudioChunk: (audioBase64, language = null, model = 'small') => {
      segmentNumber++;
      const message = {
        session_id: sessionId,
        segment_number: segmentNumber,
        audio: audioBase64,
        filename: `segment_${segmentNumber}.wav`,
        language: language,
        model: model
      };
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        console.log(`📤 Sent segment ${segmentNumber}`);
      } else {
        console.error('WebSocket is not open. ReadyState:', ws.readyState);
      }
    },
    close: () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    },
    getSegmentNumber: () => segmentNumber
  };
};
