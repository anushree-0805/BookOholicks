import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  postType: {
    type: String,
    enum: ['text', 'review', 'quote', 'media', 'streak', 'event', 'nft_flex'],
    required: true
  },
  content: {
    text: String,
    bookTitle: String,
    bookAuthor: String,
    rating: Number, // For reviews (1-5)
    quote: String,
    quoteAuthor: String
  },
  media: [{
    type: String, // URLs to images/videos
    url: String,
    mediaType: { type: String, enum: ['image', 'video'] }
  }],
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    default: null,
    index: true
  },
  hashtags: [{
    type: String
  }],
  links: [{
    url: String,
    platform: { type: String, enum: ['amazon', 'goodreads', 'other'] }
  }],
  // NFT/Streak references
  nftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT',
    default: null
  },
  streakId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReadingStreak',
    default: null
  },
  // Engagement
  likes: [{
    userId: String,
    timestamp: { type: Date, default: Date.now }
  }],
  comments: [{
    userId: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  reposts: [{
    userId: String,
    timestamp: { type: Date, default: Date.now }
  }],
  // Stats
  stats: {
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    repostCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 }
  },
  // Visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
postSchema.index({ createdAt: -1 });
postSchema.index({ communityId: 1, createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

export default mongoose.model('Post', postSchema);
