import express from 'express';
import Campaign from '../models/Campaign.js';
import CampaignClaim from '../models/CampaignClaim.js';
import Brand from '../models/Brand.js';
import User from '../models/User.js';
import NFT from '../models/NFT.js';
import { verifyToken } from '../config/firebase.js';
import blockchainService from '../services/blockchainService.js';

const router = express.Router();

// Get all campaigns for a brand
router.get('/brand/:brandId', verifyToken, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ brandId: req.params.brandId }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
});

// Get all pending campaigns (for admin - temporarily open, add auth later)
router.get('/pending/all', verifyToken, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'pending_approval' }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending campaigns', error: error.message });
  }
});

// Get single campaign
router.get('/:campaignId', verifyToken, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaign', error: error.message });
  }
});

// Create new campaign
router.post('/', verifyToken, async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();

    // Update brand's campaign count
    await Brand.findOneAndUpdate(
      { userId: req.body.brandId },
      { $inc: { totalCampaigns: 1 } }
    );

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error creating campaign', error: error.message });
  }
});

// Update campaign
router.put('/:campaignId', verifyToken, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.campaignId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error updating campaign', error: error.message });
  }
});

// Update campaign status (pause/resume/complete)
router.patch('/:campaignId/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.campaignId,
      { status },
      { new: true }
    );
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error updating campaign status', error: error.message });
  }
});

// Mint NFT (increment minted count)
router.post('/:campaignId/mint', verifyToken, async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (!campaign.unlimited && campaign.minted + quantity > campaign.totalSupply) {
      return res.status(400).json({ message: 'Exceeds total supply' });
    }

    campaign.minted += quantity;
    await campaign.save();

    // Update brand's NFT count
    await Brand.findOneAndUpdate(
      { userId: campaign.brandId },
      { $inc: { totalNFTsMinted: quantity } }
    );

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error minting NFT', error: error.message });
  }
});

// Claim NFT (increment claimed count)
router.post('/:campaignId/claim', verifyToken, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.claimed >= campaign.minted) {
      return res.status(400).json({ message: 'No NFTs available to claim' });
    }

    campaign.claimed += 1;
    await campaign.save();

    // Update brand's NFT count
    await Brand.findOneAndUpdate(
      { userId: campaign.brandId },
      { $inc: { totalNFTsClaimed: 1 } }
    );

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error claiming NFT', error: error.message });
  }
});

// Redeem NFT (increment redeemed count)
router.post('/:campaignId/redeem', verifyToken, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.redeemed += 1;
    campaign.analytics.conversionRate = (campaign.redeemed / campaign.claimed) * 100;
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error redeeming NFT', error: error.message });
  }
});

// Get campaign analytics
router.get('/:campaignId/analytics', verifyToken, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const analytics = {
      campaignName: campaign.campaignName,
      campaignType: campaign.campaignType,
      status: campaign.status,
      minted: campaign.minted,
      claimed: campaign.claimed,
      redeemed: campaign.redeemed,
      totalSupply: campaign.unlimited ? 'Unlimited' : campaign.totalSupply,
      claimRate: campaign.minted > 0 ? ((campaign.claimed / campaign.minted) * 100).toFixed(2) : 0,
      conversionRate: campaign.analytics.conversionRate.toFixed(2),
      views: campaign.analytics.views,
      scans: campaign.analytics.scans,
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Delete campaign
router.delete('/:campaignId', verifyToken, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Update brand's campaign count
    await Brand.findOneAndUpdate(
      { userId: campaign.brandId },
      { $inc: { totalCampaigns: -1 } }
    );

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting campaign', error: error.message });
  }
});

// ==================== PHYGITAL NFT ROUTES ====================

// Submit campaign for approval
router.post('/:campaignId/submit-for-approval', verifyToken, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft campaigns can be submitted for approval' });
    }

    campaign.status = 'pending_approval';
    await campaign.save();

    res.json({ message: 'Campaign submitted for approval', campaign });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting campaign', error: error.message });
  }
});

// Approve campaign (admin only - add auth middleware in production)
router.post('/:campaignId/approve', verifyToken, async (req, res) => {
  try {
    const { adminUserId } = req.body;
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Campaign is not pending approval' });
    }

    campaign.status = 'approved';
    campaign.approvedBy = adminUserId || req.user.uid;
    campaign.approvedAt = new Date();
    await campaign.save();

    res.json({ message: 'Campaign approved successfully', campaign });
  } catch (error) {
    res.status(500).json({ message: 'Error approving campaign', error: error.message });
  }
});

// Reject campaign (admin only)
router.post('/:campaignId/reject', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.status = 'draft';
    campaign.rejectionReason = reason;
    await campaign.save();

    res.json({ message: 'Campaign rejected', campaign });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting campaign', error: error.message });
  }
});

// Pre-mint NFTs to escrow wallet (for phygital campaigns)
router.post('/:campaignId/pre-mint', verifyToken, async (req, res) => {
  try {
    const { escrowWallet } = req.body;
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'approved') {
      return res.status(400).json({ message: 'Campaign must be approved before pre-minting' });
    }

    if (campaign.blockchain.preMinted) {
      return res.status(400).json({ message: 'NFTs already pre-minted for this campaign' });
    }

    // Batch mint to escrow wallet
    const result = await blockchainService.batchMintToEscrow(
      escrowWallet,
      campaign.totalSupply,
      {
        name: campaign.campaignName,
        description: campaign.description,
        category: campaign.category,
        rarity: campaign.rarity,
        brand: campaign.brandName,
        benefits: campaign.benefits
      }
    );

    if (!result.success) {
      return res.status(500).json({ message: 'Blockchain minting failed', error: result.error });
    }

    // Update campaign
    campaign.blockchain.preMinted = true;
    campaign.blockchain.preMintTransactionHash = result.transactionHash;
    campaign.blockchain.tokenIds = result.tokenIds;
    campaign.blockchain.escrowWallet = escrowWallet;
    campaign.minted = result.tokenIds.length;
    await campaign.save();

    res.json({
      message: 'NFTs pre-minted successfully',
      tokenIds: result.tokenIds,
      transactionHash: result.transactionHash
    });
  } catch (error) {
    res.status(500).json({ message: 'Error pre-minting NFTs', error: error.message });
  }
});

// Get active campaigns (user-facing)
router.get('/active/all', async (req, res) => {
  try {
    const now = new Date();
    const campaigns = await Campaign.find({
      status: 'active',
      startDate: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    }).sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active campaigns', error: error.message });
  }
});

// Check if user is eligible for campaign
router.get('/:campaignId/check-eligibility/:userId', verifyToken, async (req, res) => {
  try {
    const { campaignId, userId } = req.params;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Import and use eligibility service
    const { checkEligibility } = await import('../services/eligibilityService.js');
    const eligibilityResult = await checkEligibility(userId, campaign);

    res.json(eligibilityResult);
  } catch (error) {
    res.status(500).json({ message: 'Error checking eligibility', error: error.message });
  }
});

export default router;
