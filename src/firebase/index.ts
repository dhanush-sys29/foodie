'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Re-export hooks and types
export { FirebaseProvider, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser, type UserProfile } from './auth/use-user';


let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase() {
  if (getApps().length === 0) {
    if (!firebaseConfig.projectId || firebaseConfig.projectId === 'REPLACE_WITH_YOUR_PROJECT_ID') {
      console.warn('Firebase config is not set. Please update src/firebase/config.ts');
      // You can either throw an error or return dummy objects
      // For a smoother development experience, we'll avoid throwing an error.
    }
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}

export { initializeFirebase };
