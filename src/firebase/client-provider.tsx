'use client';

import type { ReactNode } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';

// This provider is responsible for initializing Firebase on the client side.
// It should be used as a wrapper around the root of the application.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { firebaseApp, auth, firestore } = initializeFirebase();

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
