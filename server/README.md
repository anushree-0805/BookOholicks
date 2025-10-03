# Bookoholics Backend Server

Backend server for the Bookoholics platform built with Express, MongoDB, and Firebase Auth.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Firebase Project (for authentication)
- Cloudinary Account (for image storage)

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB on your machine
- Start MongoDB service
- Use connection string: `mongodb://localhost:27017/bookoholics`

**Option B: MongoDB Atlas (Recommended)**
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a new cluster
- Get your connection string
- Replace `<username>`, `<password>`, and `<cluster-url>` in the connection string

### 3. Set Up Firebase Admin SDK

1. Go to Firebase Console (https://console.firebase.google.com/)
2. Select your project (ideanest-9cf3c)
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract the following from the JSON:
   - `project_id`
   - `private_key`
   - `client_email`

### 4. Set Up Cloudinary

1. Create account at https://cloudinary.com/
2. Go to Dashboard
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret

### 5. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookoholics

# Firebase Admin SDK
FIREBASE_PROJECT_ID=ideanest-9cf3c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ideanest-9cf3c.iam.gserviceaccount.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Important:** Make sure the private key includes the actual line breaks (`\n`).

### 6. Run the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Users
- `GET /api/users/:userId` - Get user profile
- `POST /api/users` - Create user profile
- `PUT /api/users/:userId` - Update user profile
- `POST /api/users/:userId/profile-pic` - Upload profile picture

### Reading Streaks
- `GET /api/streaks/:userId` - Get streak data
- `POST /api/streaks/log-session` - Log reading session
- `POST /api/streaks/:userId/claim-reward` - Claim streak reward

### NFTs
- `GET /api/nfts/:userId` - Get user's NFT collection
- `POST /api/nfts/mint` - Mint new NFT
- `POST /api/nfts/:nftId/redeem` - Redeem NFT

### Reading Sessions
- `GET /api/reading-sessions/:userId` - Get reading sessions
- `GET /api/reading-sessions/:userId/weekly-stats` - Get weekly stats

## Testing the API

You can test if the server is running:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB service is running
- Verify connection string is correct
- For Atlas, make sure your IP is whitelisted

### Firebase Authentication Issues
- Verify Firebase credentials are correct
- Make sure the private key has proper line breaks
- Check that the service account has proper permissions

### Cloudinary Upload Issues
- Verify API credentials
- Check file size limits
- Ensure proper file formats (jpg, png, gif, webp)

## Project Structure

```
server/
├── config/           # Configuration files
│   ├── db.js        # MongoDB connection
│   ├── firebase.js  # Firebase Admin setup
│   └── cloudinary.js # Cloudinary setup
├── models/          # Mongoose models
│   ├── User.js
│   ├── ReadingStreak.js
│   ├── ReadingSession.js
│   └── NFT.js
├── routes/          # API routes
│   ├── users.js
│   ├── streaks.js
│   ├── nfts.js
│   └── sessions.js
└── server.js        # Main server file
```

## Security Notes

- Never commit `.env` file to version control
- Keep your Firebase private key secure
- Use environment variables for all sensitive data
- Enable CORS only for trusted domains in production
