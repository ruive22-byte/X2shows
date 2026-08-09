// src/services/cloudSyncService.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

function getDb(): Firestore | null {
  if (dbInstance) return dbInstance;

  const meta = import.meta as any;
  const apiKey = meta?.env?.VITE_FIREBASE_API_KEY;
  const projectId = meta?.env?.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    return null;
  }

  try {
    const firebaseConfig = {
      apiKey: meta?.env?.VITE_FIREBASE_API_KEY,
      authDomain: meta?.env?.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: meta?.env?.VITE_FIREBASE_PROJECT_ID,
      storageBucket: meta?.env?.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: meta?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: meta?.env?.VITE_FIREBASE_APP_ID,
    };

    if (!getApps().length) {
      appInstance = initializeApp(firebaseConfig);
    } else {
      appInstance = getApps()[0];
    }
    dbInstance = getFirestore(appInstance);
    return dbInstance;
  } catch (err) {
    console.warn('☁️ Firebase initialization deferred or offline:', err);
    return null;
  }
}

export class CloudSyncService {
  /**
   * Syncs watch progress to Firestore and caches locally
   */
  public static async syncWatchProgress(
    userId: string,
    showId: number,
    progress: { season: number; episode: number; progressSeconds: number }
  ) {
    // 1. Local Cache
    try {
      localStorage.setItem(`progress_${showId}`, JSON.stringify(progress));
    } catch {
      // Ignore quota errors
    }

    // 2. Cloud Sync
    if (!userId) return;
    const db = getDb();
    if (!db) return;

    try {
      const userRef = doc(db, 'users', userId, 'watchProgress', String(showId));
      await setDoc(userRef, { ...progress, updatedAt: new Date().toISOString() }, { merge: true });
    } catch {
      console.warn('☁️ Cloud Sync offline, relying on local storage fallback.');
    }
  }

  /**
   * Fetches user watch progress across devices
   */
  public static async getUserProgress(userId: string, showId: number) {
    if (!userId) {
      const local = localStorage.getItem(`progress_${showId}`);
      return local ? JSON.parse(local) : null;
    }

    const db = getDb();
    if (db) {
      try {
        const userRef = doc(db, 'users', userId, 'watchProgress', String(showId));
        const snap = await getDoc(userRef);
        if (snap.exists()) return snap.data();
      } catch {
        // Fall back to local below
      }
    }

    const local = localStorage.getItem(`progress_${showId}`);
    return local ? JSON.parse(local) : null;
  }
}
