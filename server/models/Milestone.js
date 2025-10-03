import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  milestoneType: {
    type: String,
    enum: ['post_count', 'engagement_likes', 'engagement_comments', 'streak_days', 'books_read'],
    required: true
  },
  milestone: {
    type: Number,
    required: true
  },
  achieved: {
    type: Boolean,
    default: false
  },
  achievedAt: {
    type: Date
  },
  nftAwarded: {
    type: Boolean,
    default: false
  },
  nftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT'
  },
  metadata: {
    description: String,
    badgeName: String,
    rewardType: String
  }
}, {
  timestamps: true
});

// Indexes for performance
milestoneSchema.index({ userId: 1, milestoneType: 1, milestone: 1 }, { unique: true });
milestoneSchema.index({ achieved: 1 });

export default mongoose.model('Milestone', milestoneSchema);
