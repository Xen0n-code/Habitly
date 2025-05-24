
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface Habit {
  id: string;
  name: string;
  ownerId: string;
  participantUids: string[];
  createdAt: Timestamp;
  description?: string;
  inviteLink?: string; // For display purposes, generated on client
}

export interface StreakData {
  id: string; // habitId_userId
  habitId: string;
  userId: string;
  currentStreak: number;
  lastCheckInDate: string | null; // YYYY-MM-DD format
  userName?: string; // Denormalized for leaderboard
  userPhotoURL?: string; // Denormalized for leaderboard
}

// Utility function to get YYYY-MM-DD string
export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
    