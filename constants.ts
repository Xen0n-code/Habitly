
export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  HABITS: 'habits',
  STREAKS: 'streaks',
};

export const GEMINI_MODELS = {
  TEXT: 'gemini-2.5-flash-preview-04-17',
  IMAGE: 'imagen-3.0-generate-002',
};

// Updated Firebase config
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCi_S0O7nLO4rPloRJgkfy1idX7ZWgqL-c",
  authDomain: "habitly-25006.firebaseapp.com",
  projectId: "habitly-25006",
  storageBucket: "habitly-25006.appspot.com", // Corrected to .appspot.com for storageBucket
  messagingSenderId: "252576678545",
  appId: "1:252576678545:web:2caaeec343592ac8bcf530",
  measurementId: "G-3MCGC759J1"
};

// Helper to check if essential Firebase config values are placeholders (for local dev)
// In a real production scenario, these would ideally be set via environment variables
// and this check might be different or unnecessary if env vars are guaranteed.
export const isFirebaseConfigured = () => {
  return FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY_HERE" &&
         FIREBASE_CONFIG.projectId !== "YOUR_PROJECT_ID_HERE";
};

if (process.env.NODE_ENV !== 'development' && !isFirebaseConfigured()) {
  console.warn(
    "Firebase configuration seems to be using placeholder values. " +
    "Ensure your Firebase config is correctly set up, especially for production builds."
  );
}
