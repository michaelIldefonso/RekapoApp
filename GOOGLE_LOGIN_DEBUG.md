# Google Login Debug Guide

## 🔍 Why it works on one device but not another?

If the app works fine on your device but gets stuck on your friend's device, it's likely one of these device-specific issues:

### Device-Specific Causes:
1. **Google Account Cache** - Previous failed sign-in attempts are cached
2. **Google Play Services Version** - Older versions behave differently
3. **Network Speed** - Slower connection causing backend timeout
4. **Multiple Google Accounts** - Account selection conflict
5. **App Cache** - Old authentication state not cleared

### How to Diagnose:

**Step 1: Enable USB Debugging and Check Console Logs**

Connect your friend's device and run:
```bash
# For Android
npx react-native log-android

# For iOS  
npx react-native log-ios
```

**Step 2: Look for These Log Messages During Login:**

The app now logs every step:
```
🔍 Checking Google Play Services...
✅ Google Play Services available
📊 Current sign-in status: true/false
🔄 Signing out existing session...
✅ Signed out successfully
🚀 Starting Google sign-in...
✅ Got user info from Google
🔑 Getting ID token...
✅ Got ID token
🌐 Connecting to backend: http://...
⏱️ Backend responded in XXXms
💾 Storing user data and token...
✅ User data stored successfully
```

**Step 3: Identify Where It Gets Stuck**

If the logs stop at a specific step, that's your issue:

| Stops After | Problem | Solution |
|------------|---------|----------|
| "Checking Google Play Services..." | Play Services issue | Update Google Play Services |
| "Starting Google sign-in..." | Google Sign-In hanging | Clear Google app cache & data |
| "Connecting to backend..." | Network/Backend issue | Check backend URL & internet |
| "Backend responded in 15000ms" | Backend timeout | Check backend performance |

---

## ⚠️ Quick Fixes to Try First

### Issue 1: App Stuck on Loading Spinner
**Symptoms:** The loading spinner appears after clicking "Continue with Google" but never disappears.

**Possible Causes:**
1. Network timeout - backend server not responding
2. Google Play Services issue
3. Missing or incorrect Google Web Client ID
4. Backend server is down or unreachable

**Solutions:**
- ✅ Now includes 15-second timeout with proper error handling
- ✅ Loading state is always cleared, even on errors
- ✅ Better error messages to identify the specific issue

### Issue 2: Google Sign-In Cancelled
**Symptoms:** Sign-in window opens then closes immediately.

**Possible Causes:**
1. User cancelled the sign-in
2. Google account not available on device
3. Google Play Services configuration issue

**Solutions:**
- ✅ Now checks and prompts to update Google Play Services if needed
- ✅ Signs out any existing session before starting new login
- ✅ Doesn't show error alert if user intentionally cancelled

### Issue 3: Backend Verification Fails
**Symptoms:** Google sign-in succeeds but then shows "Login Failed" error.

**Possible Causes:**
1. Backend server is down
2. Invalid Google Web Client ID configuration
3. Network connectivity issues
4. Backend API endpoint changed

**Solutions:**
- ✅ Now includes timeout handling (15 seconds)
- ✅ Better error messages showing specific backend errors
- ✅ Validates response data before proceeding

## How to Debug on Your Friend's Device

### Step 1: Enable Developer Console Logs
1. Connect the device to a computer with USB debugging enabled
2. Run: `npx react-native log-android` (Android) or `npx react-native log-ios` (iOS)
3. Try to log in and watch for error messages

### Step 2: Check for Specific Error Codes
Look for these error codes in the logs:
- `PLAY_SERVICES_NOT_AVAILABLE` - Google Play Services missing/outdated
- `SIGN_IN_CANCELLED` - User cancelled the sign-in
- `IN_PROGRESS` - Another sign-in is already happening
- `Connection timeout` - Backend server not responding
- `Invalid response from server` - Backend returned unexpected data

### Step 3: Test Network Connectivity
```javascript
// Add this temporary test function to LoginScreen.js
const testBackendConnection = async () => {
  try {
    const response = await fetch(`${config.BACKEND_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    console.log('Backend health check:', response.status);
  } catch (error) {
    console.error('Backend unreachable:', error);
  }
};
```

### Step 4: Verify Google Play Services
On Android devices:
1. Go to Settings → Apps → Google Play Services
2. Check the version (should be recent)
3. Clear cache and data if needed
4. Restart the device

### Step 5: Check Environment Configuration
Verify the `.env` file has correct values:
```
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
BACKEND_API_URL=https://your-backend-server.com
```

## What Was Fixed

1. **Better Error Handling**
   - Added specific error codes for different failure scenarios
   - Clear error messages that identify the problem
   - Timeout handling for network requests

2. **Loading State Management**
   - Loading spinner is ALWAYS cleared, even on errors
   - No more stuck loading states

3. **Google Sign-In Improvements**
   - Automatically checks for Google Play Services
   - Signs out existing session before new login
   - Validates all response data

4. **User Data Recovery**
   - App now properly loads stored user data on startup
   - If token exists but user data is missing, forces re-login

5. **Network Resilience**
   - 15-second timeout for backend requests
   - Better error messages for network issues
   - Validates response data before storing

## Testing Checklist

- [ ] Try logging in with Google
- [ ] Check if error messages appear (and what they say)
- [ ] Test with WiFi disabled (should show timeout error)
- [ ] Test on fresh app install
- [ ] Check console logs for specific error codes
- [ ] Verify Google Play Services is up to date (Android only)

## Still Having Issues?

If the problem persists, collect this information:
1. Device model and OS version
2. Error message shown (screenshot)
3. Console logs during login attempt
4. Whether backend server is accessible from the device's network
5. Google Play Services version (Android only)
