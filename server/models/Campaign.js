import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  brandId: {
    type: String,
    required: true,
    ref: 'Brand',
    index: true
  },
  brandName: {
    type: String,
    required: true
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
  category: {
    type: String,
    enum: ['streak', 'genre', 'reward', 'event', 'achievement', 'community'],
    default: 'reward'
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
    enum: ['qr_code', 'airdrop', 'redeem_code', 'claim', 'manual'],
    default: 'claim'
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

  // Phygital-specific: Physical Item Details
  physicalItem: {
    name: String,
    description: String,
    images: [String],
    estimatedValue: Number,
    shippingInfo: String,
    enabled: {
      type: Boolean,
      default: false
    }
  },

  // Eligibility Criteria (for claim-based campaigns)
  eligibility: {
    type: {
      type: String,
      enum: ['purchase', 'engagement', 'community', 'streak', 'event', 'open', 'custom']
    },
    requirements: mongoose.Schema.Types.Mixed,
    // Examples:
    // { minPurchaseAmount: 100 }
    // { minPostLikes: 50, minComments: 10 }
    // { communityId: 'xyz', minPosts: 5 }
    description: String
  },

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
    enum: ['draft', 'pending_approval', 'approved', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  // Admin Approval
  approvedBy: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    scans: { type: Number, default: 0 },
    participants: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  // Blockchain
  blockchain: {
    contractAddress: String,
    chainId: Number,
    preMinted: {
      type: Boolean,
      default: false
    },
    preMintTransactionHash: String,
    tokenIds: [String], // For pre-minted NFTs
    escrowWallet: String // Wallet holding pre-minted NFTs
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
campaignSchema.index({ status: 1, startDate: 1, endDate: 1 });

// Virtual fields
campaignSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' &&
         this.startDate <= now &&
         (!this.endDate || this.endDate >= now) &&
         (!this.unlimited && this.claimed < this.totalSupply);
});

campaignSchema.virtual('nftsRemaining').get(function() {
  return this.unlimited ? 'Unlimited' : this.totalSupply - this.claimed;
});

campaignSchema.virtual('isPhygital').get(function() {
  return this.campaignType === 'phygital' && this.physicalItem?.enabled;
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

export default mongoose.model('Campaign', campaignSchema);
