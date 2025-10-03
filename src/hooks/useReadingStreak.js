import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '../config/api';

export const useReadingStreak = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [readingSessions, setReadingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch streak data
  const fetchStreakData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/streaks/${user.uid}`);
      setStreakData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching streak data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Log a reading session
  const logReadingSession = async (sessionData) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const session = {
        userId: user.uid,
        bookTitle: sessionData.bookTitle,
        minutesRead: parseInt(sessionData.minutes),
        pagesRead: parseInt(sessionData.pages),
        notes: sessionData.notes || ''
      };

      const response = await api.post('/streaks/log-session', session);
      setReadingSessions([response.data.session, ...readingSessions]);
      await fetchStreakData(); // Refresh streak data
      return { success: true, data: response.data };
    } catch (err) {
      return { error: err.response?.data?.message || err.message };
    }
  };

  // Get reading sessions
  const fetchReadingSessions = async (limit = 10) => {
    if (!user) return;

    try {
      const response = await api.get(`/reading-sessions/${user.uid}?limit=${limit}`);
      setReadingSessions(response.data);
    } catch (err) {
      console.error('Error fetching reading sessions:', err);
    }
  };

  // Claim streak reward
  const claimStreakReward = async (rewardDays) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const response = await api.post(`/streaks/${user.uid}/claim-reward`, { rewardDays });
      await fetchStreakData(); // Refresh streak data
      return { success: true, nft: response.data.nft };
    } catch (err) {
      return { error: err.response?.data?.message || err.message };
    }
  };

  useEffect(() => {
    if (user) {
      fetchStreakData();
      fetchReadingSessions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    streakData,
    readingSessions,
    loading,
    error,
    logReadingSession,
    claimStreakReward,
    refreshStreak: fetchStreakData
  };
};
