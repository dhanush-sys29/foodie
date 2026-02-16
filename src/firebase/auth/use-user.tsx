'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, type DocumentData } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';

export interface UserProfile extends DocumentData {
  role: 'customer' | 'restaurant' | 'delivery';
  email: string;
  restaurantId?: string;
}

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
  
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        // If no user, we are done loading.
        setProfile(null);
        setLoading(false);
      }
    });
  
    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    // If we have no user, the auth useEffect will have already set loading to false.
    if (!user || !firestore) {
      return;
    }
  
    const profileRef = doc(firestore, "users", user.uid);
  
    const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
      // Once we have a snapshot (or know it doesn't exist), we are done loading.
      setLoading(false);
    });
  
    return () => unsubscribeProfile();
  }, [user, firestore]);
  

  return { user, profile, loading };
}
