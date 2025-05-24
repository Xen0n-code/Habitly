
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { FIREBASE_CONFIG, FIRESTORE_COLLECTIONS } from '../constants';
import type { UserProfile, Habit, StreakData } from '../types';
import { getLocalDateString } from '../types';


const firebaseApp = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export const onAuthChange = (callback: (user: UserProfile | null) => void): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        // Create user profile if it doesn't exist
        await setDoc(userRef, {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid
        });
      }
      callback({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      });
    } else {
      callback(null);
    }
  });
};

export const signInWithGoogle = async (): Promise<UserProfile | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, user.uid);
    
    // Check if user profile exists, if not, create it
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      });
    }
    
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };
  } catch (error) {
    console.error("Googleサインインエラー:", error);
    return null;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("サインアウトエラー:", error);
  }
};

export const createHabit = async (userId: string, name: string, description?: string): Promise<Habit | null> => {
  try {
    const habitRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.HABITS), {
      name,
      description: description || '',
      ownerId: userId,
      participantUids: [userId],
      createdAt: serverTimestamp(),
    });
    
    // Create initial streak for the owner
    const streakId = `${habitRef.id}_${userId}`;
    const userProfile = await getUserProfile(userId);
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.STREAKS, streakId), {
      habitId: habitRef.id,
      userId: userId,
      currentStreak: 0,
      lastCheckInDate: null,
      userName: userProfile?.displayName,
      userPhotoURL: userProfile?.photoURL
    });

    return { 
      id: habitRef.id, 
      name, 
      ownerId: userId, 
      participantUids: [userId], 
      createdAt: Timestamp.now(), // Approximate, actual is serverTimestamp
      description 
    };
  } catch (error) {
    console.error("習慣の作成エラー:", error);
    return null;
  }
};

export const getUserHabits = async (userId: string): Promise<Habit[]> => {
  try {
    const q = query(collection(db, FIRESTORE_COLLECTIONS.HABITS), where("participantUids", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Habit));
  } catch (error) {
    console.error("習慣の取得エラー:", error);
    return [];
  }
};

export const getHabitById = async (habitId: string): Promise<Habit | null> => {
  try {
    const habitRef = doc(db, FIRESTORE_COLLECTIONS.HABITS, habitId);
    const docSnap = await getDoc(habitRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Habit;
    }
    return null;
  } catch (error) {
    console.error("習慣詳細の取得エラー:", error);
    return null;
  }
};

export const getStreakData = async (habitId: string, userId: string): Promise<StreakData | null> => {
  try {
    const streakId = `${habitId}_${userId}`;
    const streakRef = doc(db, FIRESTORE_COLLECTIONS.STREAKS, streakId);
    const docSnap = await getDoc(streakRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as StreakData;
    }
    return null;
  } catch (error) {
    console.error("連続記録データの取得エラー:", error);
    return null;
  }
};

export const checkInHabit = async (habitId: string, userId: string): Promise<StreakData | null> => {
  const streakId = `${habitId}_${userId}`;
  const streakRef = doc(db, FIRESTORE_COLLECTIONS.STREAKS, streakId);
  
  try {
    const docSnap = await getDoc(streakRef);
    if (!docSnap.exists()) {
      console.error("連続記録データが見つかりません。");
      return null; // Or create it if joining
    }

    const currentData = docSnap.data() as StreakData;
    const todayString = getLocalDateString(new Date());
    let newStreak = currentData.currentStreak;

    if (currentData.lastCheckInDate === todayString) {
      // Already checked in today
      return currentData;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = getLocalDateString(yesterday);

    if (currentData.lastCheckInDate === yesterdayString || currentData.lastCheckInDate === null) {
      // Continuous or first check-in
      newStreak = (currentData.lastCheckInDate === null) ? 1 : newStreak + 1;
    } else {
      // Streak broken (missed more than one day)
      newStreak = 1;
    }
    
    const updatedData = { ...currentData, currentStreak: newStreak, lastCheckInDate: todayString };
    await updateDoc(streakRef, {
      currentStreak: newStreak,
      lastCheckInDate: todayString,
    });
    return updatedData;

  } catch (error) {
    console.error("習慣のチェックインエラー:", error);
    return null;
  }
};

export const getHabitLeaderboard = async (habitId: string): Promise<StreakData[]> => {
  try {
    const q = query(collection(db, FIRESTORE_COLLECTIONS.STREAKS), where("habitId", "==", habitId));
    const querySnapshot = await getDocs(q);
    const streaks = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as StreakData));
    return streaks.sort((a, b) => b.currentStreak - a.currentStreak);
  } catch (error) {
    console.error("ランキングの取得エラー:", error);
    return [];
  }
};

export const joinHabit = async (habitId: string, userId: string): Promise<boolean> => {
  try {
    const habitRef = doc(db, FIRESTORE_COLLECTIONS.HABITS, habitId);
    const habitSnap = await getDoc(habitRef);

    if (!habitSnap.exists()) {
      console.error("参加する習慣が見つかりません。");
      return false;
    }

    const habitData = habitSnap.data() as Habit;
    if (habitData.participantUids.includes(userId)) {
      return true; // Already a participant
    }

    await updateDoc(habitRef, {
      participantUids: arrayUnion(userId)
    });

    const streakId = `${habitId}_${userId}`;
    const userProfile = await getUserProfile(userId);
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.STREAKS, streakId), {
      habitId: habitId,
      userId: userId,
      currentStreak: 0,
      lastCheckInDate: null,
      userName: userProfile?.displayName,
      userPhotoURL: userProfile?.photoURL
    });
    return true;
  } catch (error) {
    console.error("習慣への参加エラー:", error);
    return false;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("ユーザープロファイルの取得エラー:", error);
    return null;
  }
};

export { auth, db };
    