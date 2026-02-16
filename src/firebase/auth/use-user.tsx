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
  
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false); // 🔥 ALWAYS set loading here
    });
  
    return () => unsubscribe();
  }, []); // 🔥 IMPORTANT: empty dependency array

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
  
    if (!firestore) return;
  
    const profileRef = doc(firestore, "users", user.uid);
  
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
    });
  
    return () => unsubscribe();
  }, [user, firestore]);
  

  return { user, profile, loading };
}
