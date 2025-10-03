# Bookoholics Platform - Complete Setup Guide

## Project Overview

Bookoholics is a platform for book lovers to earn phygital NFT rewards for reading. Features include:
- Reading streak tracking
- NFT rewards that never expire
- Profile management with Cloudinary image storage
- Community engagement (coming soon)

## Tech Stack

**Frontend:**
- React 19 with Vite
- TailwindCSS for styling
- Lucide React for icons
- React Router for navigation
- Axios for API calls
- Firebase Authentication

**Backend:**
- Node.js with Express
- MongoDB for database
- Firebase Admin for auth verification
- Cloudinary for image storage

## Complete Setup Instructions

### 1. Frontend Setup

#### Install Dependencies
```bash
npm install
```

#### Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

#### Firebase Configuration
Your Firebase is already configured in `src/firebase/config.js`:
- Project ID: ideanest-9cf3c
- Just make sure authentication is enabled in Firebase Console

#### Run Frontend
```bash
npm run dev
```

The app will run on `http://localhost:5173`

### 2. Backend Setup

#### Navigate to Server Directory
```bash
cd server
```

#### Install Dependencies
```bash
npm install
```

#### Set Up MongoDB

**Option 1: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Replace `<password>` with your database user password

**Option 2: Local MongoDB**
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use `mongodb://localhost:27017/bookoholics`

#### Set Up Firebase Admin SDK

1. Go to https://console.firebase.google.com/
2. Select project: **ideanest-9cf3c**
3. Settings (⚙️) → Project Settings
4. Service Accounts tab
5. Click "Generate New Private Key"
6. Download JSON file
7. You'll need these fields from the JSON:
   - `project_id`
   - `private_key`
   - `client_email`

#### Set Up Cloudinary

1. Create account at https://cloudinary.com/
2. Go to Dashboard
3. Copy credentials:
   - Cloud Name
   - API Key
   - API Secret

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `server/.env` with your credentials:

```env
PORT=5000

# MongoDB - Use your connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookoholics

# Firebase Admin SDK - From downloaded JSON
FIREBASE_PROJECT_ID=ideanest-9cf3c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ideanest-9cf3c.iam.gserviceaccount.com

# Cloudinary - From dashboard
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Important:** The private key must include `\n` for line breaks. Copy it exactly as it appears in the JSON file.

#### Run Backend Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 3. Verify Setup

#### Test Backend
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

#### Test Frontend
1. Open `http://localhost:5173`
2. Sign up with email/password
3. You should be redirected to dashboard
4. Check if profile is created in MongoDB

### 4. Running Both Services

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd server
npm run dev
```

## Color Theme

The platform uses a clean, elegant design with these colors:
- Primary: `#4a6359` (Dark green)
- Accent 1: `#a56b8a` (Dark pink/mauve)
- Accent 2: `#d4a960` (Gold)
- Backgrounds: `#f5f1e8`, `#faf7f0` (Cream/beige tones)
- Text: Gray scale for better readability

## Project Structure

```
bookoholics/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── dashboard/
│   │       ├── Overview.jsx
│   │       ├── ProfileEdit.jsx
│   │       ├── ReadingStreak.jsx
│   │       └── NFTCollection.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── Dashboard.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useUserProfile.js
│   │   ├── useReadingStreak.js
│   │   └── useNFTs.js
│   ├── config/
│   │   └── api.js
│   ├── firebase/
│   │   └── config.js
│   └── App.jsx
├── server/
│   ├── config/
│   │   ├── db.js
│   │   ├── firebase.js
│   │   └── cloudinary.js
│   ├── models/
│   │   ├── User.js
│   │   ├── ReadingStreak.js
│   │   ├── ReadingSession.js
│   │   └── NFT.js
│   ├── routes/
│   │   ├── users.js
│   │   ├── streaks.js
│   │   ├── nfts.js
│   │   └── sessions.js
│   └── server.js
└── package.json
```

## Key Features

### User Dashboard
- Clean, professional interface
- Profile editing with image upload to Cloudinary
- Genre preferences selection
- Reading goals tracking

### Reading Streaks
- Daily reading tracking
- Streak maintenance logic
- Milestone rewards at 7, 10, 15, 30, 50 days
- Automatic NFT minting on milestones

### NFT Collection
- Display all earned NFTs
- Filter by category
- Rarity system (Common, Rare, Epic, Legendary, Mythic)
- Redemption system for benefits

## Common Issues

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### MongoDB Connection Failed
- Check if MongoDB is running
- Verify connection string
- For Atlas: Whitelist your IP address

### Firebase Auth Errors
- Check Firebase console for enabled auth methods
- Verify API keys in both frontend and backend
- Make sure service account has admin privileges

### Cloudinary Upload Fails
- Verify credentials are correct
- Check file size (max 10MB by default)
- Ensure file format is supported

## Next Steps

1. Complete the remaining dashboard components styling
2. Add community features
3. Implement Kindle integration for reading tracking
4. Add brand partnership dashboard
5. Deploy to production

## Support

If you encounter any issues, check:
- Browser console for frontend errors
- Terminal logs for backend errors
- MongoDB connection status
- Firebase authentication settings
