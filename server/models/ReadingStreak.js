import mongoose from 'mongoose';

const readingStreakSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalDays: {
    type: Number,
    default: 0
  },
  lastReadDate: {
    type: Date,
    default: null
  },
  streakStartDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('ReadingStreak', readingStreakSchema);
