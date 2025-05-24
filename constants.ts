export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  HABITS: 'habits',
  STREAKS: 'streaks',
};

export const GEMINI_MODELS = {
  TEXT: 'gemini-2.5-flash-preview-04-17',
  IMAGE: 'imagen-3.0-generate-002',
};

// ✅ Firebase config（本番環境用）
export const firebaseConfig = {
  apiKey: "AIzaSyCi_S0O7nLO4rPloRJgkfy1idX7ZWgqL-c",
  authDomain: "habitly-25006.firebaseapp.com",
  projectId: "habitly-25006",
  storageBucket: "habitly-25006.appspot.com", // ← 正しいURLに修正
  messagingSenderId: "252576678545",
  appId: "1:252576678545:web:2caaeec343592ac8bcf530",
  measurementId: "G-3MCGC759J1"
};

// ✅ Firebase設定が最低限あるか確認する関数（開発補助）
export const isFirebaseConfigured = () => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
};

// ✅ 本番で未設定だったら警告（あくまで注意喚起）
if (process.env.NODE_ENV !== 'development' && !isFirebaseConfigured()) {
  console.warn(
    "⚠️ Firebase config appears to be incomplete. Please double-check your setup."
  );
}
