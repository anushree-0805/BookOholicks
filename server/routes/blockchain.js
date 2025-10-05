import express from 'express';
import { verifyToken } from '../config/firebase.js';
import blockchainService from '../services/blockchainService.js';
import User from '../models/User.js';
import NFT from '../models/NFT.js';

const router = express.Router();

// Connect wallet address to user account
router.post('/connect-wallet', verifyToken, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const userId = req.user.uid;

    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Update user with wallet address
    const user = await User.findOneAndUpdate(
      { userId },
      { walletAddress: walletAddress.toLowerCase() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mint any existing off-chain NFTs to blockchain
    const offChainNFTs = await NFT.find({ userId, onChain: false });

    const mintResults = [];
    for (const nft of offChainNFTs) {
      try {
        const result = await blockchainService.mintNFT(
          walletAddress,
          {
            name: nft.name,
            description: nft.description,
            category: nft.category,
            rarity: nft.rarity,
            rewardType: nft.category, // Use category as fallback
            brand: nft.brand,
            benefits: nft.benefits
          }
        );

        if (result.success) {
          nft.tokenId = result.tokenId;
          nft.transactionHash = result.transactionHash;
          nft.blockNumber = result.blockNumber;
          nft.onChain = true;
          await nft.save();
          mintResults.push({ nftId: nft._id, tokenId: result.tokenId });
        }
      } catch (error) {
        console.error('Error minting existing NFT:', error);
      }
    }

    res.json({
      message: 'Wallet connected successfully',
      walletAddress: user.walletAddress,
      nftsMinted: mintResults.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting wallet', error: error.message });
  }
});

// Get blockchain NFTs for user
router.get('/nfts/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user?.walletAddress) {
      return res.json({ nfts: [], message: 'No wallet connected' });
    }

    const result = await blockchainService.getUserNFTs(user.walletAddress);

    if (result.success) {
      res.json({ nfts: result.nfts });
    } else {
      res.status(500).json({ message: 'Error fetching blockchain NFTs', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching NFTs', error: error.message });
  }
});

// Redeem NFT on blockchain
router.post('/nfts/:tokenId/redeem', verifyToken, async (req, res) => {
  try {
    const { tokenId } = req.params;
    const userId = req.user.uid;

    const user = await User.findOne({ userId });

    if (!user?.walletAddress) {
      return res.status(400).json({ message: 'No wallet connected' });
    }

    const result = await blockchainService.redeemNFT(tokenId, user.walletAddress);

    if (result.success) {
      // Also update database
      await NFT.findOneAndUpdate(
        { tokenId },
        { redeemed: true, redeemedAt: new Date() }
      );

      res.json({
        message: 'NFT redeemed successfully',
        transactionHash: result.transactionHash
      });
    } else {
      res.status(500).json({ message: 'Error redeeming NFT', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error redeeming NFT', error: error.message });
  }
});

// Get contract statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const result = await blockchainService.getContractStats();

    if (result.success) {
      res.json(result.stats);
    } else {
      res.status(500).json({ message: 'Error fetching stats', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Manually mint NFT (admin only - for testing)
router.post('/mint', verifyToken, async (req, res) => {
  try {
    const { walletAddress, nftData } = req.body;

    if (!walletAddress || !nftData) {
      return res.status(400).json({ message: 'walletAddress and nftData are required' });
    }

    const result = await blockchainService.mintNFT(walletAddress, nftData);

    if (result.success) {
      res.json({
        message: 'NFT minted successfully',
        tokenId: result.tokenId,
        transactionHash: result.transactionHash
      });
    } else {
      res.status(500).json({ message: 'Error minting NFT', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error minting NFT', error: error.message });
  }
});

export default router;
