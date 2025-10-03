import express from 'express';
import NFT from '../models/NFT.js';
import { verifyToken } from '../config/firebase.js';

const router = express.Router();

// Get user's NFT collection
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const nfts = await NFT.find({ userId: req.params.userId }).sort({ dateEarned: -1 });
    res.json(nfts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mint new NFT
router.post('/mint', verifyToken, async (req, res) => {
  try {
    const nft = new NFT(req.body);
    const savedNFT = await nft.save();
    res.status(201).json(savedNFT);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Redeem NFT
router.post('/:nftId/redeem', verifyToken, async (req, res) => {
  try {
    const nft = await NFT.findById(req.params.nftId);

    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    if (nft.redeemed) {
      return res.status(400).json({ message: 'NFT already redeemed' });
    }

    nft.redeemed = true;
    nft.redeemedAt = new Date();
    await nft.save();

    res.json({ message: 'NFT redeemed successfully', redeemedAt: nft.redeemedAt });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
