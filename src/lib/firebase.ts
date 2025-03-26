import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration with the provided credentials
const firebaseConfig = {
  apiKey: "AIzaSyCfNYW6t7mGLzxgg_opsFA9ZtvxUW6N0C8",
  authDomain: "ai-tracker-90ce0.firebaseapp.com",
  projectId: "ai-tracker-90ce0",
  storageBucket: "ai-tracker-90ce0.firebasestorage.app",
  messagingSenderId: "954189815072",
  appId: "1:954189815072:web:98d57df0f28bdfb50d4b45",
  measurementId: "G-Y294P6WKYP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 