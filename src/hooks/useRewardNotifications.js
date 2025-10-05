import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import api from '../config/api';

export const useRewardNotifications = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  // Check for new rewards every 30 seconds
  useEffect(() => {
    if (!user) return;

    const checkForNewRewards = async () => {
      try {
        const response = await api.get(`/rewards/${user.uid}`);
        const rewards = response.data;

        // Find recently earned rewards (within last minute)
        const recentRewards = rewards.filter(reward => {
          if (!reward.earned || !reward.earnedAt) return false;

          const earnedTime = new Date(reward.earnedAt).getTime();
          const now = Date.now();
          const oneMinuteAgo = now - 60000;

          // Only show if earned recently and after last check
          return earnedTime > oneMinuteAgo && (!lastChecked || earnedTime > lastChecked);
        });

        if (recentRewards.length > 0) {
          // Show notification for the most recent reward
          const latestReward = recentRewards[0];

          // Fetch the NFT details
          try {
            const nftResponse = await api.get(`/nfts/${user.uid}`);
            const nft = nftResponse.data.find(n => n._id === latestReward.nftId?.toString());

            if (nft) {
              setNotification({
                type: latestReward.type,
                name: nft.name,
                description: nft.description,
                rarity: nft.rarity,
                benefits: nft.benefits,
                image: nft.image
              });
            }
          } catch (nftError) {
            console.error('Error fetching NFT details:', nftError);
          }

          setLastChecked(Date.now());
        }
      } catch (error) {
        console.error('Error checking for rewards:', error);
      }
    };

    // Check immediately
    checkForNewRewards();

    // Then check every 30 seconds
    const interval = setInterval(checkForNewRewards, 30000);

    return () => clearInterval(interval);
  }, [user, lastChecked]);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    closeNotification
  };
};
