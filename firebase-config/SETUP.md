# Firebase Dynamic Config Setup

This allows you to update your backend URL without rebuilding the app!

## Setup Steps

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Create a Firebase Project
- Go to https://console.firebase.google.com/
- Create a new project (or use existing)
- Enable Firebase Hosting

### 4. Initialize Firebase in this directory
```bash
cd firebase-config
firebase init hosting
```
- Select your project
- Set public directory: `.` (current directory)
- Configure as single-page app: **No**
- Don't overwrite config.json or firebase.json

### 5. Deploy to Firebase
```bash
firebase deploy --only hosting
```

### 6. Update app.config.js
After deployment, Firebase will give you a hosting URL like:
```
https://your-project.web.app
```

Update this line in `src/config/app.config.js`:
```javascript
const FIREBASE_CONFIG_URL = 'https://your-project.web.app/config.json';
```

### 7. Rebuild Your App ONE TIME
```bash
eas build --platform android --profile development
```

## Usage (No Rebuild Needed!)

### Update Backend URL Anytime
1. Edit `firebase-config/config.json`:
   ```json
   {
     "backendUrl": "https://abc123.ngrok.io"
   }
   ```

2. Deploy:
   ```bash
   cd firebase-config
   firebase deploy --only hosting
   ```

3. Restart your app - it fetches the new URL on startup!

## Testing
- Your app will log: `✅ Updated BACKEND_URL from Firebase: https://...`
- Falls back to .env if Firebase fetch fails
- No cache - always gets fresh config

## Benefits
✅ Update backend URL instantly without rebuild  
✅ Perfect for ngrok development  
✅ Free Firebase hosting  
✅ Works with preview builds  
