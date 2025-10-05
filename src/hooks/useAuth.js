import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import api from '../config/api';

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
          const response = await api.get(`/users/${firebaseUser.uid}`);
          const userData = response.data;

          // If user is a brand, also fetch brand profile
          if (userData.accountType === 'brand') {
            try {
              const brandResponse = await api.get(`/brands/${firebaseUser.uid}`);
              setUserProfile({ ...userData, brandProfile: brandResponse.data });
            } catch (brandError) {
              console.error('Error fetching brand profile:', brandError);
              setUserProfile(userData);
            }
          } else {
            setUserProfile(userData);
          }
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
      await api.post('/users', {
        userId: userCredential.user.uid,
        email: userCredential.user.email,
        accountType,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If brand account, also create brand profile
      if (accountType === 'brand') {
        await api.post('/brands', {
          userId: userCredential.user.uid,
          email: userCredential.user.email,
          name: email.split('@')[0], // Default name from email
          verified: false,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

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
      const response = await api.get(`/users/${userCredential.user.uid}`, {
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

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const response = await api.get(`/users/${user.uid}`);
        const userData = response.data;

        // If user is a brand, also fetch brand profile
        if (userData.accountType === 'brand') {
          try {
            const brandResponse = await api.get(`/brands/${user.uid}`);
            setUserProfile({ ...userData, brandProfile: brandResponse.data });
          } catch (brandError) {
            console.error('Error fetching brand profile:', brandError);
            setUserProfile(userData);
          }
        } else {
          setUserProfile(userData);
        }
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  return {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    logOut,
    refreshUserProfile,
  };
};
