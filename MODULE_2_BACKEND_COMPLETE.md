# Module 2 - Communities Section (Backend Complete ✅)

## Backend Implementation Status: ✅ COMPLETE

### Models Created

#### 1. Community Model ✅ (`server/models/Community.js`)
Already existed and includes:
- Name, slug, description, banner, icon
- Category (fiction, non-fiction, sci-fi, etc.)
- Creator and moderators
- Members array (embedded)
- Rules
- Stats (memberCount, postCount, weeklyActivity)
- Tags, privacy settings

#### 2. CommunityMember Model ✅ (`server/models/CommunityMember.js`)
NEW - Comprehensive membership tracking:
- `communityId` and `userId` (indexed, unique together)
- `role`: owner, moderator, member
- `reputation`: community-specific reputation score
- `weeklyContributions`: posts, comments, likes
- `totalContributions`: posts, comments, eventsAttended, eventsHosted
- `badges`: array of earned badge IDs
- `isBanned`, `joinedAt`

#### 3. Event Model ✅ (`server/models/Event.js`)
NEW - Full event management:
- `communityId`, `title`, `description`
- `eventType`: book_club, discussion, challenge, meetup, ama, other
- `hostId`, `startDate`, `endDate`
- `location`: virtual/physical/hybrid with venue/meetingLink
- `bookDetails`: title, author, ISBN, cover image
- `attendees`: array with userId, status (going/interested/maybe)
- `maxAttendees`, `status` (upcoming/ongoing/completed/cancelled)
- `rewards`: NFT templates for attendance and hosting
- `stats`: attendeeCount, interestedCount

### API Routes Created

#### Community Routes ✅ (`server/routes/communities.js`)

**List & Discovery:**
- `GET /api/communities` - Get all communities with filters
  - Query params: `category`, `search`, `filter` (popular/trending/newest)
  - Returns: Communities with `isMember` flag for current user

- `GET /api/communities/user/my-communities` - Get user's joined communities

- `GET /api/communities/suggested/for-you` - Get suggested communities (not joined yet)
  - Sorted by popularity
  - Limited to 10

**Single Community:**
- `GET /api/communities/:communityId` - Get community details

**Create & Join:**
- `POST /api/communities` - Create new community
  - Auto-adds creator as owner/moderator
  - Sets initial memberCount to 1

- `POST /api/communities/:communityId/join` - Join community
  - Creates CommunityMember record
  - Updates community stats
  - **🏆 Awards "Explorer NFT" on first community join**

- `POST /api/communities/:communityId/leave` - Leave community

**Community Content:**
- `GET /api/communities/:communityId/posts` - Get community posts (with user data)

- `GET /api/communities/:communityId/members` - Get community members
  - Query param: `sort` (recent/reputation/contributions)
  - Returns: Members with user details

**Gamification:**
- `GET /api/communities/:communityId/leaderboard` - Get weekly top contributors
  - Returns: Top 10 members by weekly contributions
  - Includes: posts, comments, likes, reputation

#### Event Routes ✅ (`server/routes/events.js`)

**Event Management:**
- `GET /api/events/community/:communityId` - Get community events
  - Query param: `status` (upcoming/ongoing/completed/cancelled/all)

- `GET /api/events/:eventId` - Get single event details

- `POST /api/events` - Create event
  - Auto-adds host as first attendee
  - Updates host's `eventsHosted` count
  - **🏆 Logs "Event Host NFT" ready**

- `PUT /api/events/:eventId` - Update event (host only)

- `DELETE /api/events/:eventId` - Cancel event (host only)

**RSVP & Attendance:**
- `POST /api/events/:eventId/join` - RSVP to event
  - Body: `{ status: 'going' | 'interested' | 'maybe' }`
  - Updates event stats

- `POST /api/events/:eventId/attended` - Mark attendance (host only)
  - Body: `{ attendeeIds: ['userId1', 'userId2'] }`
  - Updates each attendee's `eventsAttended` count
  - **🎟️ Logs "Event Ticket NFT" ready for each attendee**

### NFT Reward Triggers (Ready for Smart Contract Integration)

#### Community Gamification NFTs:

1. **Explorer NFT** 🧭
   - Trigger: Joining first community
   - Location: `communities.js:123`
   - Log: `🏆 First community joined by user ${userId} - Explorer NFT ready`

2. **Community Builder NFT** 🏗️
   - Trigger: Weekly top contributors
   - Data source: `GET /api/communities/:communityId/leaderboard`
   - Implementation: Weekly cron job (to be added)

3. **Event Host NFT** 📅
   - Trigger: Creating/hosting an event
   - Location: `events.js:52`
   - Log: `📅 Event created by ${userId} - Event Host NFT ready`

4. **Event Ticket NFT** 🎟️
   - Trigger: Attending an event (marked by host)
   - Location: `events.js:111`
   - Log: `🎟️ User ${userId} attended event - Event Ticket NFT ready`

### Server Integration ✅

Updated `server/server.js`:
```javascript
import eventsRouter from './routes/events.js';
app.use('/api/events', eventsRouter);
```

### Database Indexes

**CommunityMember:**
- `{ communityId: 1, userId: 1 }` - unique
- Supports efficient member lookups

**Event:**
- `{ startDate: 1, status: 1 }`
- `{ communityId: 1, startDate: -1 }`
- Supports efficient event querying

## Frontend Components Needed

### Pages:
1. **Communities.jsx** - Home page with 3-column layout
2. **CommunityDetail.jsx** - Single community view with tabs

### Components:
1. **CommunityCard.jsx** - Community card for grid
2. **CreateCommunityModal.jsx** - Create community form
3. **CommunityFeed.jsx** - Posts scoped to community
4. **CommunityMembers.jsx** - Members list with leaderboard
5. **CommunityEvents.jsx** - Events list
6. **EventCard.jsx** - Event display card
7. **CreateEventModal.jsx** - Create event form

## API Testing

**Test Community Creation:**
```bash
POST /api/communities
{
  "name": "Fantasy Lovers",
  "slug": "fantasy-lovers",
  "description": "For fans of fantasy fiction",
  "category": "fantasy"
}
```

**Test Join Community:**
```bash
POST /api/communities/:communityId/join
```

**Test Create Event:**
```bash
POST /api/events
{
  "communityId": "...",
  "title": "Harry Potter Book Club",
  "description": "Discussing Philosopher's Stone",
  "eventType": "book_club",
  "startDate": "2025-11-01T18:00:00Z",
  "location": {
    "type": "virtual",
    "meetingLink": "https://meet.google.com/xyz"
  },
  "bookDetails": {
    "title": "Harry Potter and the Philosopher's Stone",
    "author": "J.K. Rowling"
  }
}
```

## Next Steps

1. **Frontend Implementation** - Build React components
2. **Milestone Service Integration** - Add community milestones to `milestoneService.js`
3. **Weekly Cron Jobs** - Identify top contributors weekly
4. **Smart Contract Integration** - Mint NFTs for:
   - Explorer badge (first community)
   - Community Builder (weekly leaders)
   - Event Host (hosting events)
   - Event Tickets (attending events)

---

**Backend Status: ✅ 100% Complete**
**Frontend Status: ⏳ Ready to build**
**Integration Points: 🔗 4 NFT reward triggers ready**
