/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const apiKey = 
  import.meta.env.VITE_FIREBASE_API_KEY || 
  (import.meta.env as any).FIREBASE_API_KEY || 
  'AIzaSyDASyJIPuvho1GsFpUp7n5PLMdLcqKQrI0';

const projectId = 
  import.meta.env.VITE_FIREBASE_PROJECT_ID || 
  (import.meta.env as any).FIREBASE_PROJECT_ID || 
  'x2shows-prod';

const authDomain = 
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 
  (import.meta.env as any).FIREBASE_AUTH_DOMAIN || 
  `${projectId}.firebaseapp.com`;

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
export default app;

