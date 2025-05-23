
import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface HabitMember {
  uid: string;
  displayName: string;
  photoURL: string;
  currentStreak: number;
  lastCompletionDate: Timestamp | null; // Firestore Timestamp of last completion
  joinedAt: Timestamp;
}

export interface Habit {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Timestamp;
  members: { [userId: string]: HabitMember };
  inviteCode: string;
}

export enum AuthState {
  LOADING,
  AUTHENTICATED,
  UNAUTHENTICATED,
}
