import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  brandId: {
    type: String,
    required: true,
    ref: 'Brand',
    index: true
  },
  campaignName: {
    type: String,
    required: true
  },
  campaignType: {
    type: String,
    enum: ['reward', 'access', 'phygital', 'achievement'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  nftImage: {
    type: String,
    required: true
  },
  // Utility/Benefits
  utility: {
    type: {
      type: String,
      enum: ['discount', 'event_access', 'book_unlock', 'merchandise', 'signed_copy', 'other']
    },
    value: String, // e.g., "20% off", "VIP Access", etc.
    description: String
  },
  benefits: [{
    type: String
  }],
  rarity: {
    type: String,
    enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'],
    default: 'Common'
  },
  // Supply
  totalSupply: {
    type: Number,
    required: true
  },
  unlimited: {
    type: Boolean,
    default: false
  },
  minted: {
    type: Number,
    default: 0
  },
  claimed: {
    type: Number,
    default: 0
  },
  redeemed: {
    type: Number,
    default: 0
  },
  // Distribution
  distributionMethod: {
    type: String,
    enum: ['qr_code', 'airdrop', 'redeem_code', 'manual'],
    default: 'qr_code'
  },
  qrCode: {
    type: String,
    default: null
  },
  redeemCodes: [{
    code: String,
    claimed: { type: Boolean, default: false },
    claimedBy: String,
    claimedAt: Date
  }],
  // Metadata
  metadata: {
    expiresAt: Date, // null = never expires
    location: String, // for physical redemption
    eventDate: Date,
    tags: [String]
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    scans: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  // Blockchain
  contractAddress: {
    type: String,
    default: null
  },
  chainId: {
    type: Number,
    default: null // U2U chain ID
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
campaignSchema.index({ brandId: 1, status: 1 });
campaignSchema.index({ campaignType: 1, status: 1 });

export default mongoose.model('Campaign', campaignSchema);
