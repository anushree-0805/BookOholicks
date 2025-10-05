import express from 'express';
import CampaignClaim from '../models/CampaignClaim.js';
import Campaign from '../models/Campaign.js';
import NFT from '../models/NFT.js';
import { verifyToken } from '../config/firebase.js';

const router = express.Router();

// Request physical item redemption
router.post('/claims/:claimId/request-redemption', verifyToken, async (req, res) => {
  try {
    const { claimId } = req.params;
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 ||
        !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    const claim = await CampaignClaim.findById(claimId).populate('campaignId');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Verify user owns this claim
    if (claim.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if campaign is phygital
    const campaign = claim.campaignId;
    if (!campaign.isPhygital) {
      return res.status(400).json({ message: 'This campaign does not have physical redemption' });
    }

    // Check if already requested
    if (claim.physicalRedemption.requested) {
      return res.status(400).json({ message: 'Physical redemption already requested' });
    }

    // Update claim with shipping info
    claim.physicalRedemption.requested = true;
    claim.physicalRedemption.requestedAt = new Date();
    claim.physicalRedemption.status = 'pending';
    claim.physicalRedemption.shippingAddress = shippingAddress;

    await claim.save();

    // Update campaign analytics
    await Campaign.findByIdAndUpdate(campaign._id, {
      $inc: { redeemed: 1 }
    });

    res.json({
      message: 'Physical redemption requested successfully',
      claim
    });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting redemption', error: error.message });
  }
});

// Update redemption status (Brand/Admin only)
router.patch('/claims/:claimId/redemption-status', verifyToken, async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const claim = await CampaignClaim.findById(claimId);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // TODO: Add brand/admin authorization check
    // Verify requester is brand owner or admin

    claim.physicalRedemption.status = status;

    if (trackingNumber) {
      claim.physicalRedemption.trackingNumber = trackingNumber;
    }

    if (notes) {
      claim.physicalRedemption.notes = notes;
    }

    if (status === 'shipped') {
      claim.physicalRedemption.shippedAt = new Date();
    }

    if (status === 'delivered') {
      claim.physicalRedemption.deliveredAt = new Date();

      // Mark NFT as redeemed
      if (claim.nftId) {
        await NFT.findByIdAndUpdate(claim.nftId, {
          redeemed: true,
          redeemedAt: new Date()
        });
      }
    }

    await claim.save();

    res.json({
      message: 'Redemption status updated successfully',
      claim
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating redemption status', error: error.message });
  }
});

// Get all redemption requests for a campaign (Brand view)
router.get('/campaign/:campaignId/redemptions', verifyToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status } = req.query;

    const query = {
      campaignId,
      'physicalRedemption.requested': true
    };

    if (status) {
      query['physicalRedemption.status'] = status;
    }

    const claims = await CampaignClaim.find(query)
      .populate('nftId')
      .sort({ 'physicalRedemption.requestedAt': -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching redemptions', error: error.message });
  }
});

// Get user's redemption requests
router.get('/user/:userId/redemptions', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can only access their own redemptions
    if (userId !== req.user.uid) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const claims = await CampaignClaim.find({
      userId,
      'physicalRedemption.requested': true
    })
      .populate('campaignId')
      .populate('nftId')
      .sort({ 'physicalRedemption.requestedAt': -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching redemptions', error: error.message });
  }
});

// Get redemption statistics for a campaign
router.get('/campaign/:campaignId/stats', verifyToken, async (req, res) => {
  try {
    const { campaignId } = req.params;

    const totalRequests = await CampaignClaim.countDocuments({
      campaignId,
      'physicalRedemption.requested': true
    });

    const pending = await CampaignClaim.countDocuments({
      campaignId,
      'physicalRedemption.status': 'pending'
    });

    const processing = await CampaignClaim.countDocuments({
      campaignId,
      'physicalRedemption.status': 'processing'
    });

    const shipped = await CampaignClaim.countDocuments({
      campaignId,
      'physicalRedemption.status': 'shipped'
    });

    const delivered = await CampaignClaim.countDocuments({
      campaignId,
      'physicalRedemption.status': 'delivered'
    });

    const cancelled = await CampaignClaim.countDocuments({
      campaignId,
      'physicalRedemption.status': 'cancelled'
    });

    res.json({
      totalRequests,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      fulfillmentRate: totalRequests > 0 ? ((delivered / totalRequests) * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Cancel redemption request (user can cancel if not shipped)
router.post('/claims/:claimId/cancel-redemption', verifyToken, async (req, res) => {
  try {
    const { claimId } = req.params;

    const claim = await CampaignClaim.findById(claimId);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Verify user owns this claim
    if (claim.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Can only cancel if not shipped
    if (claim.physicalRedemption.status === 'shipped' ||
        claim.physicalRedemption.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel shipped/delivered items' });
    }

    claim.physicalRedemption.status = 'cancelled';
    claim.physicalRedemption.notes = 'Cancelled by user';
    await claim.save();

    res.json({
      message: 'Redemption request cancelled',
      claim
    });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling redemption', error: error.message });
  }
});

export default router;
