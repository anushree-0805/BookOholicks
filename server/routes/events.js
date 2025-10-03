import express from 'express';
import Event from '../models/Event.js';
import CommunityMember from '../models/CommunityMember.js';
import { verifyToken } from '../config/firebase.js';

const router = express.Router();

// Get all events for a community
router.get('/community/:communityId', verifyToken, async (req, res) => {
  try {
    const { status = 'upcoming' } = req.query;
    const query = { communityId: req.params.communityId };

    if (status !== 'all') {
      query.status = status;
    }

    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .lean();

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get single event
router.get('/:eventId', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// Create event
router.post('/', verifyToken, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      hostId: req.user.uid,
      attendees: [{
        userId: req.user.uid,
        status: 'going',
        joinedAt: new Date()
      }],
      stats: { attendeeCount: 1, interestedCount: 0 }
    });

    await event.save();

    // Update host's event hosting count
    await CommunityMember.findOneAndUpdate(
      { communityId: event.communityId, userId: req.user.uid },
      { $inc: { 'totalContributions.eventsHosted': 1 } }
    );

    console.log(`📅 Event created by ${req.user.uid} - Event Host NFT ready`);

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Join event / RSVP
router.post('/:eventId/join', verifyToken, async (req, res) => {
  try {
    const { status = 'going' } = req.body;
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userId = req.user.uid;
    const existingAttendee = event.attendees.find(a => a.userId === userId);

    if (existingAttendee) {
      // Update status
      existingAttendee.status = status;
    } else {
      // Check max attendees
      if (event.maxAttendees && event.stats.attendeeCount >= event.maxAttendees) {
        return res.status(400).json({ message: 'Event is full' });
      }

      // Add new attendee
      event.attendees.push({
        userId,
        status,
        joinedAt: new Date()
      });

      if (status === 'going') {
        event.stats.attendeeCount += 1;
      } else if (status === 'interested') {
        event.stats.interestedCount += 1;
      }
    }

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error joining event', error: error.message });
  }
});

// Mark event as attended (for NFT rewards)
router.post('/:eventId/attended', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only host can mark attendance
    if (event.hostId !== req.user.uid) {
      return res.status(403).json({ message: 'Only event host can mark attendance' });
    }

    const { attendeeIds } = req.body;

    // Update attendance for attendees
    for (const userId of attendeeIds) {
      await CommunityMember.findOneAndUpdate(
        { communityId: event.communityId, userId },
        { $inc: { 'totalContributions.eventsAttended': 1 } }
      );

      console.log(`🎟️ User ${userId} attended event - Event Ticket NFT ready`);
    }

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
});

// Update event
router.put('/:eventId', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.hostId !== req.user.uid) {
      return res.status(403).json({ message: 'Only event host can update' });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});

// Delete/Cancel event
router.delete('/:eventId', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.hostId !== req.user.uid) {
      return res.status(403).json({ message: 'Only event host can cancel' });
    }

    event.status = 'cancelled';
    await event.save();

    res.json({ message: 'Event cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling event', error: error.message });
  }
});

export default router;
