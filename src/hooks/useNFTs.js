import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '../config/api';

export const useNFTs = () => {
  const { user } = useAuth();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's NFT collection
  const fetchNFTs = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/nfts/${user.uid}`);
      setNfts(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mint a new NFT for user
  const mintNFT = async (nftData) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const response = await api.post('/nfts/mint', {
        userId: user.uid,
        ...nftData
      });
      setNfts([response.data, ...nfts]);
      return { success: true, nft: response.data };
    } catch (err) {
      return { error: err.response?.data?.message || err.message };
    }
  };

  // Redeem NFT benefits
  const redeemNFT = async (nftId) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const response = await api.post(`/nfts/${nftId}/redeem`, { userId: user.uid });
      // Update NFT in local state
      setNfts(nfts.map(nft =>
        nft._id === nftId ? { ...nft, redeemed: true, redeemedAt: response.data.redeemedAt } : nft
      ));
      return { success: true, data: response.data };
    } catch (err) {
      return { error: err.response?.data?.message || err.message };
    }
  };

  // Get NFT by ID
  const getNFTById = (nftId) => {
    return nfts.find(nft => nft.id === nftId);
  };

  // Filter NFTs by category
  const getNFTsByCategory = (category) => {
    if (category === 'all') return nfts;
    return nfts.filter(nft => nft.category === category);
  };

  // Get unredeemed NFTs
  const getUnredeemedNFTs = () => {
    return nfts.filter(nft => !nft.redeemed);
  };

  useEffect(() => {
    fetchNFTs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    nfts,
    loading,
    error,
    mintNFT,
    redeemNFT,
    getNFTById,
    getNFTsByCategory,
    getUnredeemedNFTs,
    refreshNFTs: fetchNFTs
  };
};
