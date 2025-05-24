
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthChange, signInWithGoogle as firebaseSignIn, signOut as firebaseSignOut } from '../services/firebaseService';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    setLoading(true);
    const signedInUser = await firebaseSignIn();
    setUser(signedInUser); // This might be redundant due to onAuthChange, but good for immediate UI update
    setLoading(false);
    return signedInUser;
  };
  
  const signOut = async (): Promise<void> => {
    setLoading(true);
    await firebaseSignOut();
    setUser(null); // This might be redundant
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
    