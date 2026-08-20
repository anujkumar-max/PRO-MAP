// ============================================
// Firebase Configuration & Initialization
// ============================================

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCiW5d_KIJ5KdrSDlnS5cs3nI_t1xiPvnw',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'techops-command-5b24f.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'techops-command-5b24f',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'techops-command-5b24f.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '818634138606',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:818634138606:web:014ebac6c9b9424ed3e4ff',
};

// Initialize Firebase (prevent re-initialization in dev mode)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
