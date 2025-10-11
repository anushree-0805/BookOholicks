import express from 'express';
import Campaign from '../models/Campaign.js';
import CampaignClaim from '../models/CampaignClaim.js';
import NFT from '../models/NFT.js';
import User from '../models/User.js';
import { verifyToken } from '../config/firebase.js';
import blockchainService from '../services/blockchainService.js';
import { checkEligibility } from '../services/eligibilityService.js';

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

    console.log(`🎯 Claim request for campaign ${campaignId} by user ${userId}`);
    console.log(`📊 Campaign status: ${campaign.status}, Claimed: ${campaign.claimed}/${campaign.totalSupply}`);

    // Check campaign is active
    if (campaign.status !== 'active') {
      console.log(`❌ Campaign is not active. Status: ${campaign.status}`);
      return res.status(400).json({ message: `Campaign is not active. Current status: ${campaign.status}` });
    }

    // Check NFTs available
    if (!campaign.unlimited && campaign.claimed >= campaign.totalSupply) {
      console.log(`❌ No NFTs remaining. Claimed: ${campaign.claimed}, Supply: ${campaign.totalSupply}`);
      return res.status(400).json({ message: 'No NFTs remaining' });
    }

    // Check eligibility
    console.log(`🔍 Checking eligibility for user ${userId}...`);
    const eligibilityResult = await checkEligibility(userId, campaign);
    console.log(`✓ Eligibility result:`, eligibilityResult);

    if (!eligibilityResult.eligible) {
      console.log(`❌ User not eligible: ${eligibilityResult.reason}`);
      return res.status(403).json({
        message: 'Not eligible for this campaign',
        reason: eligibilityResult.reason
      });
    }

    // Check if user already claimed (also checked in eligibility service, but double-check here)
    const existingClaim = await CampaignClaim.findOne({ campaignId, userId });
    if (existingClaim) {
      console.log(`❌ User already claimed this campaign`);
      return res.status(400).json({ message: 'You have already claimed this campaign' });
    }

    // Get user wallet
    console.log(`🔍 Looking up user record for userId: ${userId}`);
    const user = await User.findOne({ userId });
    console.log(`📝 User found:`, user ? `Yes (wallet: ${user.walletAddress || 'none'})` : 'No');

    if (!user) {
      console.log(`❌ User record not found in database`);
      return res.status(400).json({
        message: 'User profile not found. Please complete your profile setup.',
        hint: 'Create a user record with your wallet address first'
      });
    }

    if (!user.walletAddress) {
      console.log(`❌ User has no wallet address set`);
      return res.status(400).json({
        message: 'Please connect your wallet first',
        hint: 'Set your wallet address in your profile to claim NFTs'
      });
    }

    console.log(`✅ All checks passed. Proceeding with claim...`);

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
