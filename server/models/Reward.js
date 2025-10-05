import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'active_poster',      // 7-day posting streak
      'popular_opinion',    // 100 likes on a post
      'explorer',           // Joining communities
      'event_participant',  // Attending events
      'event_organizer',    // Creating events
      'streak_bronze',      // 7-day reading streak
      'streak_silver',      // 30-day reading streak
      'streak_gold',        // 90-day reading streak
      'streak_platinum'     // 365-day reading streak
    ]
  },
  trigger: {
    type: String,
    required: true
  },
  progress: {
    current: { type: Number, default: 0 },
    target: { type: Number, required: true }
  },
  nftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT',
    default: null
  },
  earned: {
    type: Boolean,
    default: false
  },
  earnedAt: {
    type: Date,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
rewardSchema.index({ userId: 1, type: 1 });

export default mongoose.model('Reward', rewardSchema);
