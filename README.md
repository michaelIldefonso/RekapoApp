# RekapoApp

> React Native mobile app for near real-time meeting transcription and summarization with Taglish support.

RekapoApp is the mobile client for the Rekapo platform. It records meeting audio, streams it to the backend via WebSocket for real-time transcription, and displays AI-generated summaries — all with support for Tagalog/English (Taglish) conversations.

---

## Features

- 🎙️ **Live meeting recording** — streams audio chunks to the backend in real time
- 📝 **Real-time transcription** — see the transcript appear as the meeting progresses
- 🤖 **AI summarization** — get a concise summary when the meeting ends
- 🗂️ **Session history** — browse and replay past meeting summaries
- 🔐 **Google Sign-In** — authentication via Google OAuth
- 🌙 **Dark mode** — system-wide light/dark theme toggle
- 🖼️ **Profile management** — update username and profile photo
- 🔒 **Privacy settings** — data usage consent management
- 📤 **Export** — print/share meeting summaries

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 54) |
| Build | EAS Build |
| Auth | Google Sign-In (`@react-native-google-signin`) |
| Audio | `expo-audio` / `expo-av` |
| Storage | `expo-secure-store`, `expo-file-system` |
| HTTP | Fetch API (`apiService.js`) |
| UI | React Native Paper |

---

## Project Structure

```
RekapoApp/
├── App.js                          # Root component, navigation setup
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js          # Google sign-in screen
│   │   ├── MainScreen.js           # Home dashboard
│   │   ├── StartMeetingScreen.js   # Pre-meeting setup
│   │   ├── StartRecord.js          # Active recording + live transcript
│   │   ├── SessionHistoryScreen.js # Past sessions list
│   │   ├── SessionDetailsScreen.js # Session transcript + summary
│   │   ├── ProfileScreen.js        # User profile
│   │   └── profilebutton/
│   │       ├── AboutScreen.js
│   │       ├── AccountSettingsScreen.js
│   │       └── PrivacySettingsScreen.js
│   ├── components/
│   │   ├── BottomNavigation.js     # Tab bar
│   │   ├── ThemeToggleButton.js    # Dark/light mode toggle
│   │   └── popup/                  # Modal popups (logout, delete, privacy, etc.)
│   ├── services/
│   │   ├── apiService.js           # All HTTP calls to the Rekapo API
│   │   └── authService.js          # Google auth + token storage
│   ├── styles/                     # Per-screen StyleSheet files
│   └── utils/
│       ├── connectionHelper.js     # Network connectivity checks
│       └── logger.js               # Client-side logging
├── assets/                         # App icons, splash screen
├── app.json                        # Expo app configuration
└── eas.json                        # EAS Build configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- Android Studio (for Android emulator) or Xcode (for iOS simulator)
- A running [Rekapo API](https://rekapo-api.ildf.site) instance
- Google Cloud project with OAuth 2.0 credentials

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

```env
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
BACKEND_API_URL=https://rekapo-api.ildf.site
```

### 3. Start the development server

```bash
npx expo start
```

Then press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with the Expo Go app.

---

## Building

This project uses [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
# Development build (internal distribution)
eas build --profile development --platform android

# Preview APK
eas build --profile preview --platform android

# Production APK
eas build --profile production --platform android
```

The EAS project is linked to `com.michaelildefonso.rekapoapp`.

---

## API

The app connects to the Rekapo backend at `https://rekapo-api.ildf.site`. All API calls are centralized in [src/services/apiService.js](src/services/apiService.js).

Key integrations:
- `POST /api/auth/google-mobile` — exchange Google ID token for a JWT
- `WS /api/transcribe/{session_id}` — WebSocket for streaming audio chunks
- `GET /api/sessions` — fetch session history
- `GET /api/users/me` — get user profile

---

## License

This project is licensed under the [MIT License](../Rekapo/LICENSE).
