import mongoose from 'mongoose';

const campaignClaimSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  nftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT',
    default: null
  },
  // Claim status
  status: {
    type: String,
    enum: ['pending', 'claimed', 'transferred', 'failed'],
    default: 'pending',
    index: true
  },
  // Blockchain data
  tokenId: {
    type: String,
    default: null
  },
  transferTransactionHash: {
    type: String,
    default: null
  },
  claimedAt: {
    type: Date,
    default: null
  },
  // Physical redemption (for phygital NFTs)
  physicalRedemption: {
    requested: {
      type: Boolean,
      default: false
    },
    requestedAt: Date,
    status: {
      type: String,
      enum: ['not_requested', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'not_requested'
    },
    shippingAddress: {
      fullName: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String
    },
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date,
    notes: String
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Error tracking
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes
campaignClaimSchema.index({ campaignId: 1, userId: 1 }, { unique: true });
campaignClaimSchema.index({ userId: 1, status: 1 });
campaignClaimSchema.index({ tokenId: 1 });

export default mongoose.model('CampaignClaim', campaignClaimSchema);
