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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user && firestore) {
      const profileRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (!user) {
        setLoading(false);
    }
  }, [user, firestore]);

  return { user, profile, loading };
}
