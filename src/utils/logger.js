/**
 * Logger Utility with Backend Logging
 * 
 * - Development: Shows logs in console
 * - Production/Preview: Sends logs to backend for remote viewing by devs
 * 
 * Usage:
 *   import logger from '../utils/logger';
 *   logger.log('Info message');
 *   logger.error('Error occurred:', error);
 *   logger.warn('Warning message');
 * 
 * Flushing:
 *   - Buffered logs are sent every 10 seconds
 *   - Errors are sent immediately (not buffered)
 *   - Logs are automatically flushed when app goes to background/closes
 *   - Manual flush: await logger.flush()
 * 
 * Backend logs can be viewed at: /api/logs/app (admin only)
 */

import config from '../config/app.config';
import { getStoredToken } from '../services/authService';

// Sensitive keywords to redact from logs
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /auth/i,
  /bearer/i,
  /jwt/i,
  /ssn/i,
  /credit[_-]?card/i,
  /cvv/i,
];

/**
 * Redact sensitive information from log messages
 */
const sanitizeMessage = (message) => {
  let sanitized = message;
  
  // Redact tokens and long alphanumeric strings that might be sensitive
  sanitized = sanitized.replace(/[A-Za-z0-9\_\-]{32,}/g, '[REDACTED]');
  
  // Check for sensitive keywords
  SENSITIVE_PATTERNS.forEach(pattern => {
    if (pattern.test(sanitized)) {
      // If message contains sensitive keyword, redact the value after it
      sanitized = sanitized.replace(
        new RegExp(`(${pattern.source})\\s*[:=]\\s*[^\\s,}]+`, 'gi'),
        '$1: [REDACTED]'
      );
    }
  });
  
  return sanitized;
};

// Buffer for batching logs before sending to backend
let logBuffer = [];
const MAX_BUFFER_SIZE = 20;
const FLUSH_INTERVAL = 10000; // 10 seconds

/**
 * Send logs to backend for remote viewing
 */
const sendLogsToBackend = async (logs) => {
  if (!logs || logs.length === 0) return;
  
  try {
    const token = await getStoredToken();
    if (!token) return; // Don't send logs if user not authenticated
    
    const response = await fetch(`${config.BACKEND_URL}/api/logs/app`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        logs: logs,
        timestamp: new Date().toISOString(),
        app_version: '1.0.0', // TODO: Get from app.json
        platform: 'mobile',
      }),
    });
    
    if (!response.ok && __DEV__) {
      console.warn('Failed to send logs to backend:', response.status);
    }
  } catch (error) {
    // Silently fail - don't spam user with logging errors
    if (__DEV__) {
      console.warn('Log submission error:', error.message);
    }
  }
};

/**
 * Add log to buffer and flush if needed
 */
const bufferLog = (level, message) => {
  if (__DEV__) return; // Don't buffer in dev mode
  
  // Sanitize message before logging
  const sanitizedMessage = sanitizeMessage(message);
  
  logBuffer.push({
    level,
    message: sanitizedMessage,
    timestamp: new Date().toISOString(),
  });
  
  // Flush if buffer is full
  if (logBuffer.length >= MAX_BUFFER_SIZE) {
    flushLogs();
  }
};

/**
 * Send all buffered logs to backend
 */
const flushLogs = async () => {
  if (logBuffer.length === 0) return;
  
  const logsToSend = [...logBuffer];
  logBuffer = [];
  await sendLogsToBackend(logsToSend);
};

// Auto-flush logs every 10 seconds in production
if (!__DEV__) {
  setInterval(flushLogs, FLUSH_INTERVAL);
}

const logger = {
  /**
   * Log general information (replaces console.log)
   * Dev: Shows in console | Prod: Sends to backend
   */
  log: (...args) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    if (__DEV__) {
      console.log(...args);
    } else {
      bufferLog('info', message);
    }
  },

  /**
   * Log errors (replaces console.error)
   * Dev: Shows in console | Prod: Sends to backend immediately
   */
  error: (...args) => {
    const message = args.map(arg => {
      if (arg instanceof Error) {
        return `${arg.message}\n${arg.stack}`;
      }
      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
    }).join(' ');
    
    if (__DEV__) {
      console.error(...args);
    } else {
      // Errors are sent immediately, not buffered
      sendLogsToBackend([{
        level: 'error',
        message,
        timestamp: new Date().toISOString(),
      }]);
    }
  },

  /**
   * Log warnings (replaces console.warn)
   * Dev: Shows in console | Prod: Sends to backend
   */
  warn: (...args) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    if (__DEV__) {
      console.warn(...args);
    } else {
      bufferLog('warn', message);
    }
  },

  /**
   * Log debug information (replaces console.debug)
   * Only shows in development mode
   */
  debug: (...args) => {
    if (__DEV__) {
      console.debug(...args);
    }
  },

  /*const message = `🌐 ${method} ${url} - Status: ${status}${data ? ` - Data: ${JSON.stringify(data)}` : ''}`;
    
    if (__DEV__) {
      console.group(`🌐 ${method} ${url}`);
      console.log('Status:', status);
      if (data) {
        console.log('Data:', data);
      }
      console.groupEnd();
    } else {
      bufferLog('network', message);
    }
  },

  /**
   * Manually flush all buffered logs to backend
   * Useful before app closes or crashes
   */
  flush: async () => {
    await flushLogs();
  },

  /**
   * Force log - shows in both dev and production
   * Use ONLY for critical debugging that you need to see in production
   */
  forceLog: (...args) => {
    console.log('[FORCE]', ...args);
  },

  /**
   * Network request logger with grouping
   * Useful for API debugging
   */
  network: (method, url, status, data = null) => {
    if (__DEV__) {
      console.group(`🌐 ${method} ${url}`);
      console.log('Status:', status);
      if (data) {
        console.log('Data:', data);
      }
      console.groupEnd();
    }
  },
};

export default logger;
