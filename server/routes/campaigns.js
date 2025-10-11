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
    console.log('📝 Creating campaign with data:', JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!req.body.brandId || !req.body.campaignName || !req.body.campaignType) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['brandId', 'campaignName', 'campaignType']
      });
    }

    // Provide default description if empty
    if (!req.body.description || req.body.description.trim() === '') {
      req.body.description = `${req.body.campaignName} - ${req.body.campaignType} campaign`;
    }

    // Check if brand exists, create if not
    let brand = await Brand.findOne({ userId: req.body.brandId });
    if (!brand) {
      console.log(`⚠️  Brand not found for userId: ${req.body.brandId}, creating new brand...`);
      brand = new Brand({
        userId: req.body.brandId,
        brandName: req.body.brandName || 'Unknown Brand',
        name: req.body.brandName || 'Unknown Brand',
        totalCampaigns: 0
      });
      await brand.save();
      console.log('✅ Brand created:', brand._id);
    }

    // Create campaign
    const campaign = new Campaign(req.body);
    await campaign.save();
    console.log('✅ Campaign created:', campaign._id);

    // Update brand's campaign count
    await Brand.findOneAndUpdate(
      { userId: req.body.brandId },
      { $inc: { totalCampaigns: 1 } }
    );

    res.status(201).json(campaign);
  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    res.status(500).json({
      message: 'Error creating campaign',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
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

// Pre-mint NFTs to escrow wallet (for phygital campaigns) - ASYNC
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

    if (campaign.blockchain.mintJobStatus === 'processing') {
      return res.status(400).json({ message: 'Minting already in progress' });
    }

    // Validate campaign is not unlimited
    if (campaign.unlimited) {
      return res.status(400).json({
        message: 'Cannot pre-mint unlimited campaigns',
        details: 'Unlimited campaigns should mint NFTs on-demand when claimed, not pre-minted to escrow'
      });
    }

    // Validate quantity is within smart contract limits
    const MAX_BATCH_SIZE = 100;
    if (campaign.totalSupply > MAX_BATCH_SIZE) {
      return res.status(400).json({
        message: `Cannot pre-mint more than ${MAX_BATCH_SIZE} NFTs in a single batch`,
        details: `Your campaign has ${campaign.totalSupply} NFTs. The smart contract limits batch minting to ${MAX_BATCH_SIZE} NFTs due to gas constraints. Please reduce the total supply or contact support for large campaigns.`,
        currentSupply: campaign.totalSupply,
        maxAllowed: MAX_BATCH_SIZE
      });
    }

    // Validate quantity is reasonable (minimum 1)
    if (campaign.totalSupply < 1) {
      return res.status(400).json({
        message: 'Total supply must be at least 1',
        currentSupply: campaign.totalSupply
      });
    }

    // Mark as processing and return immediately
    campaign.blockchain.mintJobStatus = 'processing';
    campaign.blockchain.mintJobStartedAt = new Date();
    campaign.blockchain.escrowWallet = escrowWallet;
    campaign.blockchain.mintJobError = null;
    await campaign.save();

    // Return immediately - minting will happen in background
    res.json({
      message: 'Pre-minting started in background',
      status: 'processing',
      campaignId: campaign._id
    });

    // Process minting in background (no await here!)
    (async () => {
      try {
        console.log(`🚀 Starting background mint for campaign ${campaign._id}`);

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

        // Reload campaign to get latest state
        const updatedCampaign = await Campaign.findById(campaign._id);

        if (!result.success) {
          // Save transaction hash even on timeout/failure for manual verification
          if (result.transactionHash) {
            updatedCampaign.blockchain.preMintTransactionHash = result.transactionHash;
          }

          // If transaction is pending (not failed), mark as pending instead of failed
          if (result.isPending) {
            updatedCampaign.blockchain.mintJobStatus = 'pending';
            updatedCampaign.blockchain.mintJobError = result.error + ' Transaction Hash: ' + result.transactionHash;
          } else {
            updatedCampaign.blockchain.mintJobStatus = 'failed';
            updatedCampaign.blockchain.mintJobError = result.error;
          }

          await updatedCampaign.save();
          console.error(`❌ Background mint failed for campaign ${campaign._id}:`, result.error);
          return;
        }

        // Update campaign with success
        updatedCampaign.blockchain.preMinted = true;
        updatedCampaign.blockchain.preMintTransactionHash = result.transactionHash;
        updatedCampaign.blockchain.tokenIds = result.tokenIds;
        updatedCampaign.blockchain.mintJobStatus = 'completed';
        updatedCampaign.blockchain.mintJobCompletedAt = new Date();
        updatedCampaign.minted = result.tokenIds.length;
        await updatedCampaign.save();

        console.log(`✅ Background mint completed for campaign ${campaign._id}`);
      } catch (error) {
        console.error(`❌ Background mint error for campaign ${campaign._id}:`, error);

        try {
          const updatedCampaign = await Campaign.findById(campaign._id);
          updatedCampaign.blockchain.mintJobStatus = 'failed';
          updatedCampaign.blockchain.mintJobError = error.message;
          await updatedCampaign.save();
        } catch (updateError) {
          console.error('Failed to update campaign status:', updateError);
        }
      }
    })();

  } catch (error) {
    res.status(500).json({ message: 'Error starting pre-mint', error: error.message });
  }
});

// Get pre-mint status
router.get('/:campaignId/pre-mint-status', verifyToken, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({
      status: campaign.blockchain.mintJobStatus,
      preMinted: campaign.blockchain.preMinted,
      transactionHash: campaign.blockchain.preMintTransactionHash,
      tokenCount: campaign.blockchain.tokenIds?.length || 0,
      error: campaign.blockchain.mintJobError,
      startedAt: campaign.blockchain.mintJobStartedAt,
      completedAt: campaign.blockchain.mintJobCompletedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pre-mint status', error: error.message });
  }
});

// Manually verify and complete pre-mint (for when transaction succeeded but confirmation timed out)
router.post('/:campaignId/verify-pre-mint', verifyToken, async (req, res) => {
  try {
    const { tokenIds } = req.body; // Array of token IDs minted
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (!campaign.blockchain.preMintTransactionHash) {
      return res.status(400).json({ message: 'No transaction hash found for this campaign' });
    }

    // Mark as completed with provided token IDs
    campaign.blockchain.preMinted = true;
    campaign.blockchain.tokenIds = tokenIds;
    campaign.blockchain.mintJobStatus = 'completed';
    campaign.blockchain.mintJobCompletedAt = new Date();
    campaign.blockchain.mintJobError = null;
    campaign.minted = tokenIds.length;
    await campaign.save();

    res.json({
      message: 'Pre-mint verified and marked as complete',
      campaign
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying pre-mint', error: error.message });
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
