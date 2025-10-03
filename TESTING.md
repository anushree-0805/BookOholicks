# Testing Guide - User Data to MongoDB

## ✅ Both Services Running

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000 ✅ Confirmed running

## How User Data Flows to MongoDB

### 1. Sign Up Flow

**What happens when a user signs up:**

1. User fills sign up form on frontend
2. Frontend → Firebase Auth creates user
3. Frontend automatically calls backend API
4. Backend creates user profile in MongoDB

**MongoDB Collection: `users`**
```javascript
{
  userId: "firebase-uid-12345",
  email: "user@example.com",
  name: "Book Enthusiast",
  bio: "",
  profilePic: null,
  interestedGenres: [],
  location: "",
  favoriteAuthor: "",
  readingGoal: "50 books/year",
  walletAddress: null,
  createdAt: "2025-10-02T...",
  updatedAt: "2025-10-02T..."
}
```

### 2. Profile Edit Flow

**When user edits profile:**

1. User updates name, bio, genres, etc.
2. Frontend calls `PUT /api/users/:userId`
3. Backend updates MongoDB document
4. Updated data returned to frontend

### 3. Profile Picture Upload

**When user uploads picture:**

1. User selects image
2. Frontend sends to `POST /api/users/:userId/profile-pic`
3. Backend uploads to **Cloudinary**
4. Cloudinary URL saved to MongoDB
5. Frontend displays image from Cloudinary URL

### 4. Reading Session Flow

**When user logs reading:**

1. User fills "Log Reading" form (book, minutes, pages)
2. Frontend calls `POST /api/streaks/log-session`
3. Backend creates 2 records:
   - **readingsessions** collection: The session details
   - **readingstreaks** collection: Updates streak count

**MongoDB Collections Created:**
```javascript
// readingsessions
{
  userId: "firebase-uid",
  bookTitle: "Harry Potter",
  minutesRead: 45,
  pagesRead: 30,
  notes: "Great chapter!",
  date: "2025-10-02T..."
}

// readingstreaks
{
  userId: "firebase-uid",
  currentStreak: 1,  // Increments each day
  longestStreak: 1,
  totalDays: 1,
  lastReadDate: "2025-10-02T...",
  streakStartDate: "2025-10-02T..."
}
```

### 5. NFT Reward Flow

**When user earns streak milestone:**

1. User reaches 7/10/15/30/50 days
2. User clicks "Claim NFT"
3. Frontend calls `POST /api/streaks/:userId/claim-reward`
4. Backend mints NFT in MongoDB

**MongoDB Collection: `nfts`**
```javascript
{
  userId: "firebase-uid",
  name: "7-Day Reading Streak",
  image: "flame",
  category: "streak",
  rarity: "Common",
  description: "Earned by maintaining a 7-day reading streak",
  benefits: [
    "10% discount on next book purchase",
    "Early access to new releases",
    "Exclusive streak badge"
  ],
  brand: "Bookoholics",
  redeemed: false,
  redeemedAt: null,
  dateEarned: "2025-10-02T..."
}
```

## Testing Steps

### Step 1: Create Account
```
1. Go to http://localhost:5173
2. Click "Sign In / Sign Up"
3. Switch to "Sign Up"
4. Enter:
   - Email: test@bookoholics.com
   - Password: Test123456
   - Confirm Password: Test123456
5. Click "Sign Up"
```

**What's Saved:**
- ✅ Firebase: User authentication
- ✅ MongoDB `users`: User profile (auto-created)

### Step 2: Edit Profile
```
1. Go to Dashboard
2. Click "Profile" tab
3. Edit:
   - Name: "John Doe"
   - Bio: "Love reading fantasy novels"
   - Select genres: Fiction, Fantasy, Mystery
   - Location: "New York"
   - Favorite Author: "Brandon Sanderson"
4. Click "Save Changes"
```

**What's Saved:**
- ✅ MongoDB `users`: Updated with new info

### Step 3: Upload Profile Picture
```
1. In Profile tab
2. Click camera icon on profile picture
3. Select an image
4. Wait for upload
```

**What's Saved:**
- ✅ Cloudinary: Image file
- ✅ MongoDB `users`: profilePic field with Cloudinary URL

### Step 4: Log Reading Session
```
1. Go to "Reading Streaks" tab
2. Click "Log Reading Session"
3. Fill in:
   - Book Title: "The Way of Kings"
   - Minutes Read: 60
   - Pages Read: 50
   - Notes: "Loving the worldbuilding!"
4. Click "Log Reading Session"
```

**What's Saved:**
- ✅ MongoDB `readingsessions`: New session record
- ✅ MongoDB `readingstreaks`: Streak counter updated

### Step 5: Check Streak & Earn NFT
```
1. Keep logging reading for 7 consecutive days
2. On day 7, you'll see "Claim NFT" button
3. Click "Claim NFT"
```

**What's Saved:**
- ✅ MongoDB `nfts`: New NFT record created

### Step 6: View NFT Collection
```
1. Go to "NFT Collection" tab
2. See all your earned NFTs
3. Click on NFT to see details
4. Click "Redeem Benefits"
```

**What's Updated:**
- ✅ MongoDB `nfts`: redeemed = true, redeemedAt = timestamp

## Verify Data in MongoDB

### Using MongoDB Compass (GUI)
```
1. Open MongoDB Compass
2. Connect to your database
3. Database: bookoholics
4. Collections:
   - users
   - readingstreaks
   - readingsessions
   - nfts
5. Click each collection to see your data
```

### Using MongoDB Atlas (Cloud)
```
1. Go to https://cloud.mongodb.com
2. Login
3. Click "Browse Collections"
4. Database: bookoholics
5. See all your collections and data
```

### Using Command Line
```bash
# Connect to MongoDB
mongosh "your-mongodb-uri"

# Switch to database
use bookoholics

# View all users
db.users.find().pretty()

# View all reading sessions
db.readingsessions.find().pretty()

# View all streaks
db.readingstreaks.find().pretty()

# View all NFTs
db.nfts.find().pretty()

# Count documents
db.users.countDocuments()
db.readingsessions.countDocuments()
db.nfts.countDocuments()
```

## API Endpoints Reference

All endpoints require Firebase authentication token in header:
```
Authorization: Bearer <firebase-token>
```

### Users
- `GET /api/users/:userId` - Get user profile
- `POST /api/users` - Create user profile (auto on signup)
- `PUT /api/users/:userId` - Update user profile
- `POST /api/users/:userId/profile-pic` - Upload profile picture

### Streaks
- `GET /api/streaks/:userId` - Get streak data
- `POST /api/streaks/log-session` - Log reading session
- `POST /api/streaks/:userId/claim-reward` - Claim streak NFT

### NFTs
- `GET /api/nfts/:userId` - Get all NFTs
- `POST /api/nfts/mint` - Mint new NFT (manual)
- `POST /api/nfts/:nftId/redeem` - Redeem NFT benefits

### Reading Sessions
- `GET /api/reading-sessions/:userId` - Get sessions
- `GET /api/reading-sessions/:userId/weekly-stats` - Get weekly stats

## Expected Behavior

### ✅ Working Correctly:
- Sign up creates user in Firebase + MongoDB
- Login fetches user data from MongoDB
- Profile edits save to MongoDB
- Image uploads go to Cloudinary
- Reading logs create sessions in MongoDB
- Streaks update automatically
- NFTs appear in collection
- All data persists across sessions

### 🔴 If Something's Wrong:
- Check browser console for errors
- Check backend terminal for logs
- Verify MongoDB connection
- Check Firebase auth token is valid
- Verify API calls in Network tab

## Current Status

✅ **Frontend**: Running on http://localhost:5173
✅ **Backend**: Running on http://localhost:5000
✅ **MongoDB**: Connected
✅ **Firebase**: Authentication working
✅ **Cloudinary**: Image upload ready

**Everything is ready! Start testing by signing up!** 🚀
