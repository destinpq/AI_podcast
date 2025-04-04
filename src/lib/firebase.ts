import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Check if running on client side
const isClient = typeof window !== 'undefined';

// Check if required Firebase environment variables are present
const hasValidConfig = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key' &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY.length > 10 &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Log status in development to help with debugging
if (process.env.NODE_ENV === 'development' && isClient) {
  console.log('Firebase config valid:', hasValidConfig);
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key-not-valid',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-app.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? { measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID } : {})
};

// Initialize Firebase only on client side and only if config is valid
let app = null;
let auth = null;
let db = null;
let storage = null;

// Only initialize Firebase in client-side environment
if (isClient) {
  try {
    const apps = getApps();
    if (apps.length) {
      app = apps[0];
    } else if (hasValidConfig) {
      app = initializeApp(firebaseConfig);
      
      // Initialize Firebase services
      if (app) {
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        
        // Use auth emulator in development if configured
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
          connectAuthEmulator(auth, 'http://localhost:9099');
        }
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
}

// Export Firebase services
export { auth, db, storage };

// Helper function to check if Firebase is configured
export const isFirebaseConfigured = () => hasValidConfig;

export default app; 