import express from 'express';
import Campaign from '../models/Campaign.js';
import Brand from '../models/Brand.js';
import { verifyToken } from '../config/firebase.js';

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

export default router;
