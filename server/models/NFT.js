import mongoose from 'mongoose';

const nftSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['streak', 'genre', 'reward', 'event', 'achievement', 'community']
  },
  rarity: {
    type: String,
    required: true,
    enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic']
  },
  description: {
    type: String,
    required: true
  },
  benefits: [{
    type: String
  }],
  brand: {
    type: String,
    default: 'Bookoholics'
  },
  redeemed: {
    type: Boolean,
    default: false
  },
  redeemedAt: {
    type: Date,
    default: null
  },
  dateEarned: {
    type: Date,
    default: Date.now
  },
  // Blockchain data
  tokenId: {
    type: String,
    default: null
  },
  transactionHash: {
    type: String,
    default: null
  },
  blockNumber: {
    type: Number,
    default: null
  },
  onChain: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('NFT', nftSchema);
