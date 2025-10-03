# Quick Start Guide

## Current Status

✅ **Frontend** - Running successfully
- URL: http://localhost:5173
- No errors

❌ **Backend** - Needs MongoDB setup
- Firebase: ✅ Configured
- Cloudinary: ✅ Configured
- MongoDB: ❌ Not connected

## Fix Backend in 2 Minutes

### Option 1: Use MongoDB Atlas (Easiest - Recommended)

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up with Google/email

2. **Create Free Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Pick a region close to you
   - Click "Create Cluster"

3. **Set Up Access**
   - Click "Database Access" → "Add New Database User"
   - Username: `bookoholics`
   - Password: (generate or create one - save it!)
   - Click "Add User"

4. **Get Connection String**
   - Click "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password from step 3

5. **Update .env File**
   Open `server/.env` and replace this line:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bookoholics
   ```

   With your Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://bookoholics:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bookoholics
   ```

6. **Whitelist Your IP**
   - In Atlas, click "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (or add your specific IP)
   - Click "Confirm"

7. **Restart Server**
   The nodemon should auto-restart, or:
   ```bash
   cd server
   npm run dev
   ```

### Option 2: Install MongoDB Locally

**Windows:**
```bash
# Download MongoDB Community Server from:
# https://www.mongodb.com/try/download/community

# After installation, start MongoDB:
net start MongoDB

# Or open MongoDB Compass (GUI tool)
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

Then restart the server:
```bash
cd server
npm run dev
```

## Test If It's Working

Once MongoDB is connected, you should see:
```
✅ MongoDB Connected: cluster0-xxxxx.mongodb.net (or localhost)
Server is running on port 5000
```

Test the API:
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

## Full Testing Flow

1. **Open frontend**: http://localhost:5173
2. **Sign up** with email/password
3. **Go to Dashboard** - should create your profile in MongoDB
4. **Edit Profile** - upload picture (goes to Cloudinary)
5. **Log Reading Session** - creates streak data
6. **Check MongoDB** - you'll see your data!

## Troubleshooting

### "Server keeps crashing"
→ MongoDB not connected. Follow steps above.

### "Cannot connect to MongoDB Atlas"
→ Check if IP is whitelisted in Network Access

### "Firebase error"
→ Private key is already configured correctly in `.env`

### "Cloudinary upload fails"
→ Credentials are already configured correctly in `.env`

## Current Configuration Summary

✅ **Firebase**: Connected
- Project: ideanest-9cf3c
- Email: firebase-adminsdk-fbsvc@ideanest-9cf3c.iam.gserviceaccount.com

✅ **Cloudinary**: Connected
- Cloud Name: dgnxrykbp

⏳ **MongoDB**: Waiting for connection
- Current: mongodb://localhost:27017/bookoholics
- Need to: Start local MongoDB OR use Atlas

## Next Steps After MongoDB is Connected

1. Test signup/login
2. Create and edit profile
3. Log reading sessions
4. Check streak tracking
5. View NFT collection

The entire platform will work once MongoDB is connected! 🚀
