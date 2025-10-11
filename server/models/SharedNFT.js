import mongoose from 'mongoose';

const sharedNFTSchema = new mongoose.Schema({
  nftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT',
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userProfilePic: {
    type: String,
    default: null
  },
  caption: {
    type: String,
    default: '',
    maxlength: 500
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  // Engagement metrics
  likes: [{
    userId: String,
    likedAt: { type: Date, default: Date.now }
  }],
  comments: [{
    userId: String,
    userName: String,
    userProfilePic: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  views: {
    type: Number,
    default: 0
  },
  sharedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
sharedNFTSchema.index({ userId: 1, sharedAt: -1 });
sharedNFTSchema.index({ sharedAt: -1 });
sharedNFTSchema.index({ 'likes.userId': 1 });

// Virtual for like count
sharedNFTSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
sharedNFTSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

sharedNFTSchema.set('toJSON', { virtuals: true });
sharedNFTSchema.set('toObject', { virtuals: true });

export default mongoose.model('SharedNFT', sharedNFTSchema);
