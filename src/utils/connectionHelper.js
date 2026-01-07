/**
 * Connection Helper Utilities
 * Provides functions to check backend server connectivity
 */
import config from '../config/app.config';

/**
 * Check if the backend server is reachable
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const checkBackendConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${config.BACKEND_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return {
        success: true,
        message: 'Backend server is online'
      };
    } else {
      return {
        success: false,
        message: `Backend returned status ${response.status}`
      };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timeout - Server not responding'
      };
    }
    return {
      success: false,
      message: `Cannot connect to backend: ${error.message}`
    };
  }
};

/**
 * Get helpful troubleshooting message based on the backend URL
 * @returns {string}
 */
export const getConnectionTroubleshootingMessage = () => {
  const backendUrl = config.BACKEND_URL;
  
  let message = `Current backend URL: ${backendUrl}\n\n`;
  message += 'Troubleshooting steps:\n\n';
  
  if (backendUrl.includes('192.168')) {
    message += '1. Make sure your phone/emulator is on the same WiFi network\n';
    message += '2. Check that the backend server is running\n';
    message += '3. Verify the IP address matches your computer\'s local IP\n';
    message += '4. Check if your firewall is blocking port 8000\n';
  } else if (backendUrl.includes('10.0.2.2')) {
    message += '1. This URL only works with Android emulator\n';
    message += '2. If using a physical device, change to your computer\'s IP (192.168.x.x)\n';
    message += '3. Make sure the backend server is running\n';
  } else if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
    message += '1. localhost only works in web browsers, not mobile apps\n';
    message += '2. Change to your computer\'s IP address (192.168.x.x)\n';
    message += '3. Use 10.0.2.2 for Android emulator\n';
  }
  
  message += '\nTo check your backend server:\n';
  message += '- Visit the backend URL in a web browser\n';
  message += '- Check the backend terminal for any errors\n';
  message += '- Ensure the backend is running on port 8000\n';
  
  return message;
};

/**
 * Validate WebSocket URL format
 * @param {string} wsUrl - WebSocket URL to validate
 * @returns {boolean}
 */
export const isValidWebSocketUrl = (wsUrl) => {
  return wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://');
};
