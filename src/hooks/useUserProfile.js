import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '../config/api';

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile from MongoDB
  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/users/${user.uid}`);
      setProfile(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // User profile doesn't exist, create one
        await createProfile();
      } else {
        setError(err.message);
        console.error('Error fetching profile:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create new user profile
  const createProfile = async () => {
    if (!user) return;

    try {
      const newProfile = {
        userId: user.uid,
        email: user.email,
        name: user.displayName || 'Book Enthusiast',
        bio: '',
        profilePic: null,
        interestedGenres: [],
        location: '',
        favoriteAuthor: '',
        readingGoal: '50 books/year'
      };

      const response = await api.post('/users', newProfile);
      setProfile(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error creating profile:', err);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const response = await api.put(`/users/${user.uid}`, updates);
      setProfile(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      return { error: err.response?.data?.message || err.message };
    }
  };

  // Upload profile picture
  const uploadProfilePic = async (file) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await api.post(`/users/${user.uid}/profile-pic`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile({ ...profile, profilePic: response.data.profilePicUrl });
      return { success: true, url: response.data.profilePicUrl };
    } catch (err) {
      return { error: err.response?.data?.message || err.message };
    }
  };

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadProfilePic,
    refreshProfile: fetchProfile
  };
};
