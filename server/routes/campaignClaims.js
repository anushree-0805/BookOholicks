import express from 'express';
import Campaign from '../models/Campaign.js';
import CampaignClaim from '../models/CampaignClaim.js';
import NFT from '../models/NFT.js';
import User from '../models/User.js';
import { verifyToken } from '../config/firebase.js';
import blockchainService from '../services/blockchainService.js';

const router = express.Router();

// Claim NFT from campaign
router.post('/:campaignId/claim', verifyToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user.uid;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check campaign is active
    if (campaign.status !== 'active') {
      return res.status(400).json({ message: 'Campaign is not active' });
    }

    // Check NFTs available
    if (!campaign.unlimited && campaign.claimed >= campaign.totalSupply) {
      return res.status(400).json({ message: 'No NFTs remaining' });
    }

    // Check if user already claimed
    const existingClaim = await CampaignClaim.findOne({ campaignId, userId });
    if (existingClaim) {
      return res.status(400).json({ message: 'You have already claimed this campaign' });
    }

    // Get user wallet
    const user = await User.findOne({ userId });
    if (!user?.walletAddress) {
      return res.status(400).json({ message: 'Please connect your wallet first' });
    }

    // Create claim record
    const claim = new CampaignClaim({
      campaignId,
      userId,
      status: 'pending'
    });

    // Create off-chain NFT record
    const nft = new NFT({
      userId,
      name: campaign.campaignName,
      image: campaign.nftImage,
      category: campaign.category,
      rarity: campaign.rarity,
      description: campaign.description,
      benefits: campaign.benefits,
      brand: campaign.brandName,
      onChain: false
    });

    await nft.save();
    claim.nftId = nft._id;

    // Handle transfer based on campaign type
    console.log('Campaign blockchain data:', JSON.stringify(campaign.blockchain, null, 2));
    console.log('Campaign claimed count:', campaign.claimed);

    if (campaign.blockchain?.preMinted && campaign.blockchain?.tokenIds?.length > 0) {
      // PHYGITAL: Transfer from escrow
      console.log('Using pre-minted NFTs. Total available:', campaign.blockchain.tokenIds.length);

      // Check if we still have NFTs available
      if (campaign.claimed >= campaign.blockchain.tokenIds.length) {
        return res.status(400).json({ message: 'No pre-minted NFTs available' });
      }

      // Get next available token (use claimed index)
      const tokenId = campaign.blockchain.tokenIds[campaign.claimed];
      console.log('Transferring token ID:', tokenId);

      const transferResult = await blockchainService.transferFromEscrow(
        campaign.blockchain.escrowWallet,
        user.walletAddress,
        tokenId
      );

      if (!transferResult.success) {
        claim.status = 'failed';
        claim.errorMessage = transferResult.error;
        await claim.save();
        return res.status(500).json({
          message: 'Failed to transfer NFT',
          error: transferResult.error
        });
      }

      // Update NFT with blockchain data
      nft.tokenId = tokenId;
      nft.transactionHash = transferResult.transactionHash;
      nft.blockNumber = transferResult.blockNumber;
      nft.onChain = true;
      await nft.save();

      claim.tokenId = tokenId;
      claim.transferTransactionHash = transferResult.transactionHash;
      claim.status = 'transferred';
    } else {
      // NON-PHYGITAL: Mint directly to user
      const mintResult = await blockchainService.mintNFT(
        user.walletAddress,
        {
          name: campaign.campaignName,
          description: campaign.description,
          category: campaign.category,
          rarity: campaign.rarity,
          rewardType: 'explorer', // Default for campaign-based
          brand: campaign.brandName,
          benefits: campaign.benefits
        }
      );

      if (!mintResult.success) {
        claim.status = 'failed';
        claim.errorMessage = mintResult.error;
        await claim.save();
        return res.status(500).json({
          message: 'Failed to mint NFT',
          error: mintResult.error
        });
      }

      // Update NFT with blockchain data
      nft.tokenId = mintResult.tokenId;
      nft.transactionHash = mintResult.transactionHash;
      nft.blockNumber = mintResult.blockNumber;
      nft.onChain = true;
      await nft.save();

      claim.tokenId = mintResult.tokenId;
      claim.transferTransactionHash = mintResult.transactionHash;
      claim.status = 'claimed';
    }

    claim.claimedAt = new Date();
    await claim.save();

    // Update campaign counters
    campaign.claimed += 1;
    campaign.analytics.completions += 1;
    await campaign.save();

    res.json({
      message: 'NFT claimed successfully',
      claim,
      nft,
      transactionHash: claim.transferTransactionHash
    });
  } catch (error) {
    console.error('Error claiming NFT:', error);
    res.status(500).json({ message: 'Error claiming NFT', error: error.message });
  }
});

// Get user's claims
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const claims = await CampaignClaim.find({ userId: req.params.userId })
      .populate('campaignId')
      .populate('nftId')
      .sort({ claimedAt: -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching claims', error: error.message });
  }
});

// Get claim details
router.get('/:claimId', verifyToken, async (req, res) => {
  try {
    const claim = await CampaignClaim.findById(req.params.claimId)
      .populate('campaignId')
      .populate('nftId');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching claim', error: error.message });
  }
});

// Get all claims for a campaign (brand view)
router.get('/campaign/:campaignId/all', verifyToken, async (req, res) => {
  try {
    const claims = await CampaignClaim.find({ campaignId: req.params.campaignId })
      .populate('nftId')
      .sort({ claimedAt: -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaign claims', error: error.message });
  }
});

export default router;
