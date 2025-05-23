
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut,
  Auth // Import Auth type
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  serverTimestamp,
  Timestamp,
  runTransaction,
  writeBatch,
  Firestore // Import Firestore type
} from 'firebase/firestore';
import type { User, Habit, HabitMember } from '../types';

// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCi_S0O7nLO4rPloRJgkfy1idX7ZWgqL-c",
  authDomain: "habitly-25006.firebaseapp.com",
  projectId: "habitly-25006",
  storageBucket: "habitly-25006.appspot.com",
  messagingSenderId: "252576678545",
  appId: "1:252576678545:web:2caaeec343592ac8bcf530"
};

let app: FirebaseApp | undefined = undefined;
let authService: Auth | undefined = undefined;
let dbService: Firestore | undefined = undefined;

const isConfigValid = 
  firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
  firebaseConfig.authDomain && firebaseConfig.authDomain !== "YOUR_FIREBASE_AUTH_DOMAIN" &&
  firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_FIREBASE_PROJECT_ID" &&
  firebaseConfig.appId && firebaseConfig.appId !== "YOUR_FIREBASE_APP_ID";

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    authService = getAuth(app);
    dbService = getFirestore(app);
    console.info("Firebase initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // app, authService, dbService will remain undefined
  }
} else {
  console.error(
    "CRITICAL Firebase Configuration Error:\n" +
    "--------------------------------------\n" +
    "The Firebase configuration in 'services/firebaseService.ts' (lines 19-24) appears to be using placeholder values or is incomplete.\n" +
    "Please replace 'YOUR_FIREBASE_API_KEY', 'YOUR_FIREBASE_AUTH_DOMAIN', etc., with your actual Firebase project credentials.\n" +
    "Habitly's features requiring Firebase (authentication, data storage) will not function correctly until this is resolved.\n" +
    "You can get these credentials from your Firebase project settings: https://console.firebase.google.com/\n" +
    "--------------------------------------"
  );
}

export const auth = authService;
export const db = dbService;

const usersCollectionName = 'users';
const habitsCollectionName = 'habits';


export const onAuthUserChanged = (callback: (user: User | null) => void): (() => void) => {
  if (!auth) {
    console.warn("Firebase Auth is not initialized. Cannot listen for auth state changes. Defaulting to unauthenticated.");
    callback(null); // Assume unauthenticated if Firebase isn't up
    return () => {}; // Return a no-op unsubscriber
  }
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      if (!db) {
        console.error("Firestore is not initialized. Cannot fetch/update user document.");
        callback({ // Return basic user info without Firestore interaction
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
        });
        return;
      }
      const usersCollection = collection(db, usersCollectionName);
      const userDocRef = doc(usersCollection, firebaseUser.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await updateDoc(userDocRef, {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          }, { merge: true });
        }
      } catch (e) {
          console.error("Error ensuring user document in Firestore:", e);
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

export const signInWithGoogle = async (): Promise<User | null> => {
  if (!auth) {
    console.error("Firebase Auth is not initialized. Cannot sign in with Google.");
    alert("Habitly is not properly configured for Firebase authentication. Please check the console for details or contact support.");
    return null;
  }
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    if (firebaseUser) {
      if (!db) {
         console.error("Firestore is not initialized. Cannot save user data after sign-in.");
         // Return user data without db interaction if db is not available
         return {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          };
      }
      const usersCollection = collection(db, usersCollectionName);
      const userDocRef = doc(usersCollection, firebaseUser.uid);
      await updateDoc(userDocRef, {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        lastLogin: serverTimestamp()
      }, { merge: true });

      return {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      };
    }
    return null;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    if ((error as any).code === 'auth/popup-closed-by-user') {
        alert("Sign-in process was cancelled.");
    } else if ((error as any).code === 'auth/network-request-failed') {
        alert("Network error during sign-in. Please check your connection.");
    } else {
        alert("An error occurred during sign-in. Please try again.");
    }
    return null;
  }
};

export const signOutUser = async (): Promise<void> => {
  if (!auth) {
    console.warn("Firebase Auth is not initialized. Sign out operation skipped.");
    return Promise.resolve();
  }
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createHabit = async (currentUser: User, habitName: string): Promise<Habit | null> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot create habit.");
    alert("Cannot create habit: Database service is not available.");
    return null;
  }
  if (!currentUser || !habitName.trim()) return null;

  const inviteCode = generateInviteCode();
  const now = Timestamp.now();

  const initialMember: HabitMember = {
    uid: currentUser.uid,
    displayName: currentUser.displayName || 'Anonymous',
    photoURL: currentUser.photoURL || `https://picsum.photos/seed/${currentUser.uid}/40/40`,
    currentStreak: 0,
    lastCompletionDate: null,
    joinedAt: now,
  };

  try {
    const habitsCollectionRef = collection(db, habitsCollectionName);
    const docRef = await addDoc(habitsCollectionRef, {
      name: habitName.trim(),
      ownerId: currentUser.uid,
      createdAt: now,
      members: {
        [currentUser.uid]: initialMember,
      },
      inviteCode: inviteCode,
    });
    return { 
      id: docRef.id, 
      name: habitName.trim(),
      ownerId: currentUser.uid,
      createdAt: now,
      members: { [currentUser.uid]: initialMember },
      inviteCode: inviteCode,
     };
  } catch (error) {
    console.error("Error creating habit:", error);
    alert("Failed to create habit. Please try again.");
    return null;
  }
};

export const getUserHabits = async (userId: string): Promise<Habit[]> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot fetch user habits.");
    return [];
  }
  if (!userId) return [];
  try {
    const habitsCollectionRef = collection(db, habitsCollectionName);
    const q = query(habitsCollectionRef, where(`members.${userId}.uid`, "==", userId));
    
    const querySnapshot = await getDocs(q);
    const habits: Habit[] = [];
    querySnapshot.forEach((docSnap) => {
      habits.push({ id: docSnap.id, ...docSnap.data() } as Habit);
    });
    return habits.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error) {
    console.error("Error fetching user habits:", error);
    if ((error as any).message && (error as any).message.includes("indexes?create_composite=")) {
        console.warn("Firestore composite index needed. Please create it using the link in the error message from Firebase console.");
        alert("A database configuration (index) is needed. See console for details.");
    }
    return [];
  }
};

export const getHabitById = async (habitId: string): Promise<Habit | null> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot fetch habit by ID.");
    return null;
  }
  if (!habitId) return null;
  try {
    const habitsCollectionRef = collection(db, habitsCollectionName);
    const docRef = doc(habitsCollectionRef, habitId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Habit;
    }
    return null;
  } catch (error) {
    console.error("Error fetching habit by ID:", error);
    return null;
  }
};

export const incrementStreak = async (habitId: string, userId: string): Promise<boolean> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot increment streak.");
    alert("Cannot update streak: Database service is not available.");
    return false;
  }
  if (!habitId || !userId) return false;
  const habitsCollectionRef = collection(db, habitsCollectionName);
  const habitRef = doc(habitsCollectionRef, habitId);

  try {
    await runTransaction(db, async (transaction) => {
      const habitDoc = await transaction.get(habitRef);
      if (!habitDoc.exists()) {
        throw new Error("Habit does not exist!");
      }

      const habitData = habitDoc.data() as Habit;
      const memberData = habitData.members[userId];

      if (!memberData) {
        throw new Error("User is not a member of this habit!");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      let newStreak = memberData.currentStreak;
      let lastCompletionDateObj = memberData.lastCompletionDate ? memberData.lastCompletionDate.toDate() : null;

      if (lastCompletionDateObj) {
        lastCompletionDateObj.setHours(0, 0, 0, 0); 
      }

      if (lastCompletionDateObj && lastCompletionDateObj.getTime() === today.getTime()) {
        console.log("Habit already completed today.");
        return; 
      }
      
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const dayBeforeYesterday = new Date(today);
      dayBeforeYesterday.setDate(today.getDate() - 2);

      if (lastCompletionDateObj === null) { 
        newStreak = 1;
      } else if (lastCompletionDateObj.getTime() === yesterday.getTime()) { 
        newStreak += 1;
      } else if (lastCompletionDateObj.getTime() === dayBeforeYesterday.getTime()) { 
        newStreak += 1; 
      } else { 
        newStreak = 1;
      }
      
      const updatedMemberData = {
        ...memberData,
        currentStreak: newStreak,
        lastCompletionDate: Timestamp.fromDate(today),
      };
      
      transaction.update(habitRef, {
        [`members.${userId}`]: updatedMemberData,
      });
    });
    return true;
  } catch (error) {
    console.error("Error incrementing streak:", error);
    alert("Failed to update streak: " + (error as Error).message);
    return false;
  }
};


export const joinHabitByInviteCode = async (currentUser: User, inviteCode: string): Promise<Habit | null> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot join habit by invite code.");
    alert("Cannot join habit: Database service is not available.");
    return null;
  }
  if (!currentUser || !inviteCode.trim()) return null;
  
  const habitsCollectionRef = collection(db, habitsCollectionName);
  const q = query(habitsCollectionRef, where("inviteCode", "==", inviteCode.trim()));
  
  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("No habit found with this invite code.");
      alert("Invalid invite code. No habit found.");
      return null;
    }

    const habitDocSnap = querySnapshot.docs[0];
    const habitData = { id: habitDocSnap.id, ...habitDocSnap.data() } as Habit;

    if (habitData.members[currentUser.uid]) {
      console.log("User is already a member of this habit.");
      alert("You are already a member of this habit.");
      return habitData; 
    }

    const now = Timestamp.now();
    const newMember: HabitMember = {
      uid: currentUser.uid,
      displayName: currentUser.displayName || 'Anonymous',
      photoURL: currentUser.photoURL || `https://picsum.photos/seed/${currentUser.uid}/40/40`,
      currentStreak: 0,
      lastCompletionDate: null,
      joinedAt: now,
    };
    
    const habitRef = doc(habitsCollectionRef, habitDocSnap.id);
    await updateDoc(habitRef, {
      [`members.${currentUser.uid}`]: newMember,
    });
    
    habitData.members[currentUser.uid] = newMember;
    return habitData;

  } catch (error) {
    console.error("Error joining habit by invite code:", error);
    alert("Failed to join habit. Please try again.");
    return null;
  }
};

export const isHabitCompletedToday = (member: HabitMember | undefined): boolean => {
  if (!member || !member.lastCompletionDate) return false;
  const lastCompletion = member.lastCompletionDate.toDate();
  lastCompletion.setHours(0,0,0,0);
  const today = new Date();
  today.setHours(0,0,0,0);
  return lastCompletion.getTime() === today.getTime();
};
