import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User'
  },
  name: {
    type: String,
    default: ''
  },
  brandName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['bookstore', 'publisher', 'author', 'event', 'other'],
    default: 'other'
  },
  socialLinks: {
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  socialMedia: {
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  verified: {
    type: Boolean,
    default: false
  },
  walletAddress: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  totalCampaigns: {
    type: Number,
    default: 0
  },
  totalNFTsMinted: {
    type: Number,
    default: 0
  },
  totalNFTsClaimed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Brand', brandSchema);
