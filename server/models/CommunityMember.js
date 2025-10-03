import mongoose from 'mongoose';

const communityMemberSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  role: {
    type: String,
    enum: ['owner', 'moderator', 'member'],
    default: 'member'
  },
  reputation: {
    type: Number,
    default: 0
  },
  weeklyContributions: {
    posts: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  },
  totalContributions: {
    posts: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    eventsAttended: { type: Number, default: 0 },
    eventsHosted: { type: Number, default: 0 }
  },
  badges: [{
    badgeId: mongoose.Schema.Types.ObjectId,
    earnedAt: Date
  }],
  isBanned: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Unique constraint: one membership record per user per community
communityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });

export default mongoose.model('CommunityMember', communityMemberSchema);
