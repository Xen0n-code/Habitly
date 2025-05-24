
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuthStatus = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthStatus must be used within an AuthProvider');
  }
  return context;
};
    