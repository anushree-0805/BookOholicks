import mongoose from 'mongoose';

const readingSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  bookTitle: {
    type: String,
    required: true
  },
  minutesRead: {
    type: Number,
    required: true
  },
  pagesRead: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('ReadingSession', readingSessionSchema);
