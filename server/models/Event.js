import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['book_club', 'discussion', 'challenge', 'meetup', 'ama', 'other'],
    required: true
  },
  hostId: {
    type: String,
    required: true,
    ref: 'User'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  location: {
    type: { type: String, enum: ['virtual', 'physical', 'hybrid'] },
    venue: String,
    address: String,
    meetingLink: String
  },
  bookDetails: {
    title: String,
    author: String,
    isbn: String,
    coverImage: String
  },
  attendees: [{
    userId: String,
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['going', 'interested', 'maybe'], default: 'going' }
  }],
  maxAttendees: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  tags: [{
    type: String
  }],
  rewards: {
    attendance: {
      enabled: { type: Boolean, default: true },
      nftTemplate: String,
      description: String
    },
    hosting: {
      enabled: { type: Boolean, default: true },
      nftTemplate: String,
      description: String
    }
  },
  stats: {
    attendeeCount: { type: Number, default: 0 },
    interestedCount: { type: Number, default: 0 }
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ communityId: 1, startDate: -1 });

export default mongoose.model('Event', eventSchema);
