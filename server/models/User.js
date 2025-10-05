import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  accountType: {
    type: String,
    enum: ['reader', 'brand'],
    default: 'reader'
  },
  name: {
    type: String,
    default: 'Book Enthusiast'
  },
  bio: {
    type: String,
    default: ''
  },
  profilePic: {
    type: String,
    default: null
  },
  interestedGenres: [{
    type: String
  }],
  location: {
    type: String,
    default: ''
  },
  favoriteAuthor: {
    type: String,
    default: ''
  },
  readingGoal: {
    type: String,
    default: '50 books/year'
  },
  walletAddress: {
    type: String,
    default: null,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
