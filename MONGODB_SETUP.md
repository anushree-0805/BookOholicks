# MongoDB Setup - Step by Step

## Option 1: MongoDB Atlas (Recommended - 100% Free)

### Step 1: Create Account (1 minute)
1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with:
   - Google account (easiest), OR
   - Email address

### Step 2: Create Free Cluster (2 minutes)
1. After login, click **"Build a Database"**
2. Choose **"M0 FREE"** tier
   - Storage: 512 MB (plenty for this project)
   - Cost: $0/month forever
3. Choose a provider and region:
   - Provider: AWS (recommended)
   - Region: Pick closest to your location
4. Cluster Name: Leave as default or name it `bookoholics`
5. Click **"Create Cluster"** (takes 1-3 minutes to deploy)

### Step 3: Create Database User (30 seconds)
1. While cluster is creating, click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Fill in:
   - **Username**: `bookoholics_admin`
   - **Password**: Click "Autogenerate Secure Password"
     - **⚠️ SAVE THIS PASSWORD!** Copy it somewhere safe
   - Authentication Method: Password
   - Database User Privileges: **"Atlas admin"**
4. Click **"Add User"**

### Step 4: Allow Network Access (30 seconds)
1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` (safe for development)
4. Click **"Confirm"**

### Step 5: Get Connection String (1 minute)
1. Click **"Database"** (left sidebar)
2. Your cluster should be ready (green dot)
3. Click **"Connect"** button on your cluster
4. Choose **"Connect your application"**
5. Driver: **Node.js**
6. Version: **5.5 or later**
7. Copy the connection string:
   ```
   mongodb+srv://bookoholics_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Your .env File (1 minute)
1. Open `D:\bookOholicks\server\.env`
2. Find this line:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bookoholics
   ```
3. Replace it with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://bookoholics_admin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/bookoholics?retryWrites=true&w=majority
   ```
4. **Replace `<password>` with the password you saved in Step 3**
5. **Add `/bookoholics` before the `?` to specify the database name**

### Example:
```env
# Before:
MONGODB_URI=mongodb://localhost:27017/bookoholics

# After:
MONGODB_URI=mongodb+srv://bookoholics_admin:MySecureP@ssw0rd@cluster0.ab1cd.mongodb.net/bookoholics?retryWrites=true&w=majority
```

### Step 7: Restart Server
The server should auto-restart with nodemon. You should see:
```
✅ MongoDB Connected: cluster0.ab1cd.mongodb.net
Server is running on port 5000
```

## Option 2: Local MongoDB

### Windows
1. **Download MongoDB Community Server**:
   - Go to: https://www.mongodb.com/try/download/community
   - Version: Latest
   - Platform: Windows
   - Package: MSI

2. **Install**:
   - Run the installer
   - Choose "Complete" installation
   - Install MongoDB as a Service (check the box)
   - Install MongoDB Compass (GUI tool - optional but recommended)

3. **Start MongoDB**:
   ```bash
   net start MongoDB
   ```

4. **Connection string is already correct in .env**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bookoholics
   ```

### Mac
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Connection string is already correct in .env
```

### Linux (Ubuntu/Debian)
```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Connection string is already correct in .env
```

## What Happens After Setup?

### Collections Created Automatically:
When you use the app, MongoDB will automatically create these collections:

1. **users** - User profiles
   ```javascript
   {
     userId: "firebase-uid",
     email: "user@example.com",
     name: "John Doe",
     bio: "Book lover",
     profilePic: "cloudinary-url",
     interestedGenres: ["Fiction", "Mystery"],
     location: "New York",
     favoriteAuthor: "J.K. Rowling",
     readingGoal: "50 books/year",
     walletAddress: "0x...",
     createdAt: "2025-01-15"
   }
   ```

2. **readingstreaks** - Streak tracking
   ```javascript
   {
     userId: "firebase-uid",
     currentStreak: 7,
     longestStreak: 15,
     totalDays: 42,
     lastReadDate: "2025-01-15",
     streakStartDate: "2025-01-08"
   }
   ```

3. **readingsessions** - Reading logs
   ```javascript
   {
     userId: "firebase-uid",
     bookTitle: "Harry Potter",
     minutesRead: 45,
     pagesRead: 30,
     notes: "Great chapter!",
     date: "2025-01-15"
   }
   ```

4. **nfts** - NFT collection
   ```javascript
   {
     userId: "firebase-uid",
     name: "7-Day Reading Streak",
     image: "flame",
     category: "streak",
     rarity: "Common",
     description: "Earned by maintaining a 7-day reading streak",
     benefits: ["10% discount", "Early access"],
     brand: "Bookoholics",
     redeemed: false,
     dateEarned: "2025-01-15"
   }
   ```

### No Manual Setup Required!
- ✅ Collections created automatically when you use the app
- ✅ Indexes created automatically
- ✅ Schema validation handled by Mongoose
- ✅ Just connect and start using!

## Verify Setup

### Test Connection:
```bash
# Backend should show:
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
Server is running on port 5000

# Test API:
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### View Data in MongoDB:

**MongoDB Atlas:**
1. Go to your cluster
2. Click "Browse Collections"
3. See your data in real-time

**MongoDB Compass (Local):**
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. See database: `bookoholics`

## Troubleshooting

### "MongoServerError: bad auth"
→ Wrong password in connection string
→ Solution: Check password, regenerate if needed

### "MongoNetworkError: connection timeout"
→ IP not whitelisted in Atlas
→ Solution: Add IP address in Network Access

### "ECONNREFUSED localhost:27017"
→ MongoDB not running locally
→ Solution: Start MongoDB service

### Connection string not working?
Make sure it has this format:
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/bookoholics?retryWrites=true&w=majority
```

**Required parts:**
- ✅ USERNAME (your database user)
- ✅ PASSWORD (replace <password>)
- ✅ cluster0.xxxxx.mongodb.net (your cluster URL)
- ✅ /bookoholics (database name)
- ✅ ?retryWrites=true&w=majority (connection options)

## Quick Reference

### MongoDB Atlas Dashboard:
- **Clusters**: View your databases
- **Database Access**: Manage users
- **Network Access**: Manage IP whitelist
- **Browse Collections**: View your data

### Useful Commands:
```bash
# Check if MongoDB is running (local)
mongod --version

# Connect to local MongoDB
mongosh mongodb://localhost:27017

# View databases
show dbs

# Use bookoholics database
use bookoholics

# View collections
show collections

# View users
db.users.find().pretty()
```

## Summary

**For 99% of users, MongoDB Atlas is the best choice:**
- ✅ Free forever
- ✅ No installation needed
- ✅ Automatic backups
- ✅ Cloud hosted
- ✅ Works from anywhere
- ✅ Takes 5 minutes to set up

**Just update one line in .env and you're done!** 🚀
