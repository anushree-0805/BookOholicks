import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import apiClient from '../config/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user profile from MongoDB
        try {
          const response = await apiClient.get(`/api/users/${firebaseUser.uid}`);
          setUserProfile(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, accountType = 'reader') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user profile in MongoDB
      const token = await userCredential.user.getIdToken();
      await apiClient.post('/api/users', {
        userId: userCredential.user.uid,
        email: userCredential.user.email,
        accountType,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { user: userCredential.user, accountType, error: null };
    } catch (error) {
      return { user: null, accountType: null, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Fetch user profile to get account type
      const token = await userCredential.user.getIdToken();
      const response = await apiClient.get(`/api/users/${userCredential.user.uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { user: userCredential.user, accountType: response.data.accountType, error: null };
    } catch (error) {
      return { user: null, accountType: null, error: error.message };
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  return {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    logOut,
  };
};
