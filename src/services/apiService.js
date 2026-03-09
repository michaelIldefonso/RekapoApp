/**
 * apiService.js — Backend API Communication Layer
 *
 * Provides all REST API and WebSocket functions for the app:
 *
 * REST API (via apiRequest helper):
 *   - getUserProfile()       → GET /api/auth/me
 *   - updateUsername()       → PATCH /api/users/me/username
 *   - uploadProfilePhoto()   → PATCH /api/users/me/photo (multipart FormData)
 *   - deleteProfilePhoto()   → DELETE /api/users/me/photo
 *   - createMeetingSession() → POST /api/sessions
 *   - getSessionHistory()    → GET /api/sessions (paginated)
 *   - getSessionDetails()    → GET /api/sessions/:id/details
 *   - updateMeetingSession() → PATCH /api/sessions/:id
 *   - deleteMeetingSession() → DELETE /api/sessions/:id
 *   - updateUserConsent()    → PATCH /api/users/me/consent
 *   - rateSegment()          → PATCH /api/sessions/:id/segments/:id/rate
 *
 * WebSocket:
 *   - connectTranscriptionWebSocket() → ws://.../api/ws/transcribe
 *     Opens a persistent WebSocket for real-time audio streaming.
 *     Returns helper methods: sendAudioChunk(), sendFinalize(), sendFinalizeAndWait(), close()
 *
 * All REST requests include:
 *   - Bearer JWT token in Authorization header
 *   - Optional Bypass-Tunnel-Reminder header (for localtunnel)
 *   - Network logging via logger utility
 */
// API Utility for making authenticated requests to backend
import { getStoredToken } from './authService';
import config from '../config/app.config';
import logger from '../utils/logger';

/**
 * Core API request helper — attaches JWT token, handles errors, logs network activity.
 * All other API functions use this as their base.
 */
export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const startTime = Date.now();
  logger.networkStart(method, endpoint);
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
    
    // Add bypass tunnel header if configured
    if (config.BYPASS_TUNNEL_IP) {
      options.headers['Bypass-Tunnel-Reminder'] = config.BYPASS_TUNNEL_IP;
    }

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${config.BACKEND_URL}/api${endpoint}`, options);
    logger.networkResponse(method, endpoint, response.status, Date.now() - startTime);
    const data = await response.json();

    if (!response.ok) {
      // Try to get detailed error message from backend
      const errorMsg = data.detail || data.message || JSON.stringify(data) || 'API request failed';
      logger.error(`API Error: ${method} ${endpoint} - ${errorMsg}`);
      logger.networkError(method, endpoint, errorMsg);
      console.error('API Error Response:', data);
      throw new Error(errorMsg);
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    logger.error(`API Request Failed: ${method} ${endpoint} - ${error.message}`);
    logger.networkError(method, endpoint, error.message);
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

// Upload profile photo as multipart form data (separate from apiRequest because of FormData)
export const uploadProfilePhoto = async (imageUri) => {
  const startTime = Date.now();
  logger.networkStart('PATCH', '/users/me/photo');
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

    const headers = {
      'Authorization': `Bearer ${token}`,
    };
    
    // Add bypass tunnel header if configured
    if (config.BYPASS_TUNNEL_IP) {
      headers['Bypass-Tunnel-Reminder'] = config.BYPASS_TUNNEL_IP;
    }

    const response = await fetch(`${config.BACKEND_URL}/api/users/me/photo`, {
      method: 'PATCH',
      headers: headers,
      body: formData,
    });

    const data = await response.json();
    logger.networkResponse('PATCH', '/users/me/photo', response.status, Date.now() - startTime);
    
    console.log('📥 Backend response status:', response.status);
    console.log('📥 Backend response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      logger.networkError('PATCH', '/users/me/photo', data.detail || 'Failed to upload photo');
      throw new Error(data.detail || 'Failed to upload photo');
    }

    logger.log('Profile photo uploaded successfully');
    return {
      success: true,
      data,
    };
  } catch (error) {
    logger.error('Photo upload failed: ' + error.message);
    logger.networkError('PATCH', '/users/me/photo', error.message);
    console.error('Photo Upload Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteProfilePhoto = async () => {
  const result = await apiRequest('/users/me/photo', 'DELETE');
  if (result.success) {
    logger.log('Profile photo deleted');
  }
  return result;
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

// ── Session Management APIs ────────────────────────────────────────────
// These functions create, read, update, and delete meeting sessions.

// Create a new meeting session — called before recording starts
export const createMeetingSession = async (sessionData) => {
  // Backend expects: { session_title?: string }
  const result = await apiRequest('/sessions', 'POST', {
    session_title: sessionData.title || sessionData.session_title || 'Untitled Meeting'
  });
  if (result.success) {
    logger.log('Session created');
  }
  return result;
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
  const result = await apiRequest(`/sessions/${sessionId}`, 'DELETE');
  if (result.success) {
    logger.log('Session deleted', { sessionId });
  }
  return result;
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
/**
 * Rate a recording segment for transcription quality
 * @param {number} sessionId - The session ID that contains the segment
 * @param {number} segmentId - The segment ID to rate
 * @param {number} rating - Quality rating from 1 (poor) to 5 (excellent)
 * @returns {Promise} Rating response with success status
 */
export const rateSegment = async (sessionId, segmentId, rating) => {
  return await apiRequest(
    `/sessions/${sessionId}/segments/${segmentId}/rate`,
    'PATCH',
    { rating }
  );
};

/**
 * WebSocket connection for real-time meeting transcription.
 *
 * Opens a WebSocket to ws://.../api/ws/transcribe with session_id and JWT token.
 * The backend processes audio through: VAD → Whisper ASR → Translation → Summarization.
 *
 * Returns an object with helper methods:
 *   - sendAudioChunk(base64Audio)  → sends encoded audio to backend
 *   - sendFinalize()               → tells backend to generate final summary
 *   - sendFinalizeAndWait(timeout)  → sendFinalize + waits for "finalized" response
 *   - close()                       → gracefully closes the WebSocket
 */
export const connectTranscriptionWebSocket = async (sessionId, onMessage, onError, onClose) => {
  const token = await getStoredToken();
  
  if (!token) {
    const error = new Error('No authentication token found');
    if (onError) onError(error);
    throw error;
  }
  
  // Convert http:// to ws:// and https:// to wss://
  const wsProtocol = config.BACKEND_URL.startsWith('https://') ? 'wss://' : 'ws://';
  const wsUrl = config.BACKEND_URL.replace(/^https?:\/\//, wsProtocol);
  
  // Add session_id and token as query parameters
  const fullUrl = `${wsUrl}/api/ws/transcribe?session_id=${sessionId}&token=${encodeURIComponent(token)}`;
  const safeUrl = fullUrl.replace(/token=[^&]+/i, 'token=[REDACTED]');
  console.log('🔌 Connecting to WebSocket:', safeUrl);
  console.log('📋 Session ID:', sessionId);
  
  let ws;
  try {
    ws = new WebSocket(fullUrl);
  } catch (instantiationError) {
    console.error('❌ WebSocket instantiation failed:', instantiationError);
    console.error('❌ Failed URL protocol:', wsProtocol);
    console.error('❌ Backend URL:', config.BACKEND_URL);
    logger.networkError('WS', safeUrl, instantiationError.message);
    
    const error = new Error('Unable to connect to transcription service. Please check your network connection.');
    if (onError) onError(error);
    throw error;
  }
  
  let segmentNumber = 0;
  let finalizeResolver = null;
  let finalizeRejecter = null;
  
  ws.onopen = () => {
    console.log('🔌 WebSocket connected successfully');
    logger.wsConnect(safeUrl);
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

      if (data.status === 'finalized' && finalizeResolver) {
        finalizeResolver(true);
        finalizeResolver = null;
        finalizeRejecter = null;
      }

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
    logger.networkError('WS', safeUrl, error?.message || 'WebSocket error');
    
    // Provide more helpful error message
    if (ws.readyState === 3) {
      console.error('⚠️ WebSocket failed to connect. Possible issues:');
      console.error('   1. Backend server may not be running');
      console.error('   2. Wrong IP address or port');
      console.error('   3. Firewall blocking the connection');
      console.error('   4. Authentication token may be invalid');
    }
    
    if (finalizeRejecter) {
      finalizeRejecter(error);
      finalizeResolver = null;
      finalizeRejecter = null;
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
    logger.wsDisconnect(safeUrl, event.code, event.reason);
    
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
    
    if (finalizeResolver) {
      // If server closed after finalization, treat as success.
      if (event.code === 1000) {
        finalizeResolver(true);
      } else if (finalizeRejecter) {
        finalizeRejecter(new Error(`WebSocket closed before finalization (${event.code})`));
      }
      finalizeResolver = null;
      finalizeRejecter = null;
    }

    if (onClose) onClose(event);
  };
  
  return {
    connection: ws,
    sendAudioChunk: (audioBase64, language = null, model = 'small') => {
      // No segment number or filename sent; backend will handle naming
      const message = {
        session_id: sessionId,
        audio: audioBase64,
        language: language,
        model: model
      };
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        console.log('📤 Sent audio segment (no number)');
      } else {
        console.error('WebSocket is not open. ReadyState:', ws.readyState);
      }
    },
    sendFinalize: () => {
      // Send a finalize message to tell backend to complete processing
      const message = {
        session_id: sessionId,
        action: 'finalize'
      };
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(message));
          console.log('📤 Sent finalize signal to backend');
          return true;
        } catch (error) {
          console.error('❌ Failed to send finalize message:', error);
          return false;
        }
      } else {
        console.warn('⚠️ WebSocket not open, cannot send finalize message');
        return false;
      }
    },
    sendFinalizeAndWait: (timeoutMs = 45000) => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.warn('⚠️ WebSocket not open, cannot finalize and wait');
        return Promise.resolve(false);
      }

      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          finalizeResolver = null;
          finalizeRejecter = null;
          console.warn('⚠️ Finalize wait timed out');
          resolve(false);
        }, timeoutMs);

        finalizeResolver = () => {
          clearTimeout(timer);
          resolve(true);
        };

        finalizeRejecter = (error) => {
          clearTimeout(timer);
          console.error('❌ Finalize wait failed:', error?.message || error);
          resolve(false);
        };

        const sent = ws.readyState === WebSocket.OPEN ? (() => {
          try {
            ws.send(JSON.stringify({ session_id: sessionId, action: 'finalize' }));
            console.log('📤 Sent finalize signal to backend (wait mode)');
            return true;
          } catch (error) {
            finalizeRejecter(error);
            return false;
          }
        })() : false;

        if (!sent) {
          clearTimeout(timer);
          finalizeResolver = null;
          finalizeRejecter = null;
          resolve(false);
        }
      });
    },
    close: () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    },
    getSegmentNumber: () => segmentNumber
  };
};
