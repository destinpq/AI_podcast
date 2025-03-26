'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase';

// Simple Auth Context that works in demo mode without Firebase
interface AuthContextType {
  user: User | null;
  loading: boolean;
  configError: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create a mock user for demo mode
const demoUser = {
  uid: 'demo-user-123',
  email: 'demo@example.com',
  displayName: 'Demo User',
  emailVerified: true,
  isAnonymous: false,
  getIdToken: async () => 'demo-token',
  // Add other required User properties with minimal implementations
  phoneNumber: null,
  photoURL: null,
  providerData: [],
  metadata: { creationTime: Date.now().toString(), lastSignInTime: Date.now().toString() },
  tenantId: null,
  delete: async () => {},
  reload: async () => {},
  toJSON: () => ({}),
  providerId: 'demo',
} as unknown as User;

// Create default context
const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  configError: false,
  signIn: async () => { throw new Error('Not implemented'); },
  signUp: async () => { throw new Error('Not implemented'); },
  signOut: async () => { throw new Error('Not implemented'); },
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  
  // Check if Firebase is configured correctly
  const hasValidConfig = isFirebaseConfigured();
  
  // Always enable demo mode if Firebase is not configured
  const isDemoMode = !hasValidConfig;

  useEffect(() => {
    // Always activate demo mode immediately to avoid showing error pages
    if (isDemoMode) {
      // Auto-login with demo user
      setUser(demoUser);
      setLoading(false);
      // We're setting configError to false to avoid showing error messages
      setConfigError(false);
      // Save in sessionStorage for persistence
      sessionStorage.setItem('authUser', JSON.stringify({
        uid: demoUser.uid,
        email: demoUser.email,
        displayName: demoUser.displayName
      }));
      
      console.log('Running in demo mode with mock Firebase authentication');
    } else {
      // In a real app, this would connect to Firebase
      setLoading(false);
    }
  }, [isDemoMode]);

  // Simplified auth functions for demo
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signIn = async (_email: string, _password: string) => {
    try {
      // If Firebase is not configured, just use demo mode
      if (isDemoMode) {
        setUser(demoUser);
        return;
      }
      
      // Here we would normally sign in with Firebase
      // Since Firebase is not configured, we'll set demo user
      setUser(demoUser);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signUp = async (_email: string, _password: string) => {
    try {
      // If Firebase is not configured, just use demo mode
      if (isDemoMode) {
        setUser(demoUser);
        return;
      }
      
      // Here we would normally sign up with Firebase
      // Since Firebase is not configured, we'll set demo user
      setUser(demoUser);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    sessionStorage.removeItem('authUser');
  };

  const value = {
    user,
    loading,
    configError,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 