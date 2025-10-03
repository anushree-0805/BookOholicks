import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  banner: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['fiction', 'non-fiction', 'sci-fi', 'fantasy', 'mystery', 'romance', 'biography', 'self-help', 'general'],
    required: true
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  moderators: [{
    type: String,
    ref: 'User'
  }],
  members: [{
    userId: String,
    joinedAt: { type: Date, default: Date.now },
    reputation: { type: Number, default: 0 }
  }],
  rules: [{
    title: String,
    description: String
  }],
  stats: {
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    weeklyActivity: { type: Number, default: 0 }
  },
  tags: [{
    type: String
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

communitySchema.index({ name: 'text', description: 'text' });
communitySchema.index({ category: 1 });

export default mongoose.model('Community', communitySchema);
