/**
 * File-Based Logger (No Database Required)
 * 
 * Sends logs to backend which saves them as JSON files
 * Perfect for thesis projects - no database schema changes needed!
 */

import config from '../config/app.config';
import { getStoredToken } from '../services/authService';

// Sensitive keywords to redact
const SENSITIVE_PATTERNS = [
  /password/i, /token/i, /secret/i, /api[_-]?key/i,
  /auth/i, /bearer/i, /jwt/i, /ssn/i, /credit[_-]?card/i, /cvv/i,
];

const sanitizeMessage = (message) => {
  let sanitized = message;
  sanitized = sanitized.replace(/[A-Za-z0-9\_\-]{32,}/g, '[REDACTED]');
  SENSITIVE_PATTERNS.forEach(pattern => {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(
        new RegExp(`(${pattern.source})\\s*[:=]\\s*[^\\s,}]+`, 'gi'),
        '$1: [REDACTED]'
      );
    }
  });
  return sanitized;
};

let logBuffer = [];
const MAX_BUFFER_SIZE = 20;
const FLUSH_INTERVAL = 10000;

const sendLogsToBackend = async (logs) => {
  if (!logs || logs.length === 0) return;
  
  try {
    const token = await getStoredToken();
    if (!token) return;
    
    // Simple endpoint - just saves to a JSON file
    const response = await fetch(`${config.BACKEND_URL}/api/logs/write`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        logs: logs,
        batch_timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok && __DEV__) {
      console.warn('Failed to send logs:', response.status);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('Log submission error:', error.message);
    }
  }
};

const bufferLog = (level, message) => {
  if (__DEV__) return;
  
  const sanitizedMessage = sanitizeMessage(message);
  
  logBuffer.push({
    level,
    message: sanitizedMessage,
    timestamp: new Date().toISOString(),
  });
  
  if (logBuffer.length >= MAX_BUFFER_SIZE) {
    flushLogs();
  }
};

const flushLogs = async () => {
  if (logBuffer.length === 0) return;
  const logsToSend = [...logBuffer];
  logBuffer = [];
  await sendLogsToBackend(logsToSend);
};

if (!__DEV__) {
  setInterval(flushLogs, FLUSH_INTERVAL);
}

const logger = {
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
      sendLogsToBackend([{
        level: 'error',
        message,
        timestamp: new Date().toISOString(),
      }]);
    }
  },

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

  debug: (...args) => {
    if (__DEV__) {
      console.debug(...args);
    }
  },

  info: (...args) => {
    if (__DEV__) {
      console.info(...args);
    }
  },

  forceLog: (...args) => {
    console.log('[FORCE]', ...args);
  },

  network: (method, url, status, data = null) => {
    const message = `🌐 ${method} ${url} - Status: ${status}${data ? ` - Data: ${JSON.stringify(data)}` : ''}`;
    
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

  flush: async () => {
    await flushLogs();
  },
};

export default logger;
