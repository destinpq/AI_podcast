'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create a default context value
const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  signIn: async () => { throw new Error('Not implemented'); },
  signUp: async () => { throw new Error('Not implemented'); },
  signOut: async () => { throw new Error('Not implemented'); },
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Handle component mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set up auth state listener with improved handling to prevent loops
  useEffect(() => {
    if (!mounted) return;

    // Use sessionStorage to prevent unnecessary flashes and loops
    const storedUser = sessionStorage.getItem('authUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        sessionStorage.removeItem('authUser');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Store user data in sessionStorage to persist between page loads
      if (currentUser) {
        try {
          // Only store minimal user data, not the entire user object
          const minimalUserData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName
          };
          sessionStorage.setItem('authUser', JSON.stringify(minimalUserData));
        } catch (e) {
          console.error('Failed to store user data', e);
        }
      } else {
        sessionStorage.removeItem('authUser');
      }
    });

    return () => unsubscribe();
  }, [mounted]);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 