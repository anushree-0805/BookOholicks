# Quick Start Guide - NFT Sharing Feature

## What's Been Fixed & Added

### 1. ✅ NFT Image Display Fixed
NFTs now show the actual images uploaded by brands instead of just emoji placeholders.

### 2. ✅ NFT Sharing Feature Added
Users can now share their NFTs to a community gallery where others can like, comment, and appreciate their achievements!

## How to Use (For Users)

### Share Your NFT:
1. Go to your **NFT Collection** (My NFTs)
2. Click on any NFT to see details
3. Click the **"Share"** button
4. Add an optional caption (up to 500 characters)
5. Click **"Share to Community"**
6. Done! Your NFT is now in the Community Gallery 🎉

### View Community Gallery:
1. Navigate to **Community NFT Gallery** (add to your navigation menu)
2. Browse NFTs shared by other users
3. Sort by:
   - **Most Recent** 🕒 - Latest shares
   - **Most Popular** ❤️ - Most liked
   - **Trending** 🔥 - Most viewed

### Engage with NFTs:
- **Like**: Click the heart icon (it fills red when you like)
- **Comment**: Click on an NFT, scroll to comments, and add your thoughts
- **View**: Click any NFT to see full details

## Integration Steps (For Developers)

### Step 1: Add Gallery Route
Add the NFT Gallery to your routing:

```javascript
// In your router file (e.g., App.jsx or routes/index.jsx)
import NFTGallery from './components/community/NFTGallery';

// Add this route
<Route path="/community/nft-gallery" element={<NFTGallery />} />
```

### Step 2: Add Navigation Link
Add a link to your navigation menu:

```javascript
// Example for a sidebar/navbar
<Link to="/community/nft-gallery">
  <span>🎨 NFT Gallery</span>
</Link>
```

### Step 3: Restart Server
The backend routes are already integrated. Just restart your server:

```bash
# Stop the server (Ctrl+C)
# Start again
npm start
# or
node server/server.js
```

### Step 4: Test It!
1. Claim an NFT from an available campaign
2. Go to "My NFTs"
3. Click on the NFT and verify the image shows correctly
4. Click "Share" button
5. Add a caption and share
6. Go to Community Gallery
7. See your shared NFT appear!

## File Structure

```
New Files Created:
├── server/
│   ├── models/SharedNFT.js              # Database model for shared NFTs
│   └── routes/sharedNFTs.js             # API endpoints for sharing
└── src/
    └── components/
        └── community/
            └── NFTGallery.jsx            # Community gallery component

Modified Files:
├── server/server.js                      # Added shared-nfts route
└── src/components/dashboard/
    └── NFTCollection.jsx                 # Fixed images + added share button
```

## API Endpoints Available

```
POST   /api/shared-nfts                           # Share an NFT
GET    /api/shared-nfts/gallery                   # Get all shared NFTs
GET    /api/shared-nfts/user/:userId              # Get user's shares
GET    /api/shared-nfts/:sharedNFTId              # Get single share
PUT    /api/shared-nfts/:sharedNFTId              # Update caption
DELETE /api/shared-nfts/:sharedNFTId              # Delete share
POST   /api/shared-nfts/:sharedNFTId/like         # Like/unlike
POST   /api/shared-nfts/:sharedNFTId/comment      # Add comment
DELETE /api/shared-nfts/:sharedNFTId/comment/:id  # Delete comment
```

## Features Included

### NFT Collection (My NFTs):
- ✅ Real images from campaigns display correctly
- ✅ Share button in NFT detail modal
- ✅ Share modal with caption input
- ✅ Loading states
- ✅ Duplicate share prevention

### Community Gallery:
- ✅ Grid view of all shared NFTs
- ✅ Sort by recent/popular/trending
- ✅ Like functionality (toggle on/off)
- ✅ Comment system
- ✅ View counter
- ✅ User info display (name, profile pic)
- ✅ Full detail modal with engagement
- ✅ Beautiful, responsive design

## Quick Troubleshooting

### Images Not Showing?
- Make sure campaigns have `nftImage` field set
- Check if image URLs are accessible
- Verify CORS settings if images are hosted externally

### Can't Share NFTs?
- Ensure you're logged in
- Verify you own the NFT
- Check server console for errors
- Make sure MongoDB is running

### Gallery Empty?
- Share some NFTs first from "My NFTs"
- Check server logs for API errors
- Verify `/api/shared-nfts/gallery` endpoint works

### Likes/Comments Not Working?
- Must be logged in
- Check browser console for errors
- Verify API calls in Network tab

## Testing Checklist

- [ ] Server restarts without errors
- [ ] Gallery page loads
- [ ] NFT images show correctly in My NFTs
- [ ] Can click "Share" button on NFT
- [ ] Share modal opens
- [ ] Can enter caption and share successfully
- [ ] Shared NFT appears in Community Gallery
- [ ] Can like NFTs (heart fills)
- [ ] Can unlike NFTs (heart unfills)
- [ ] Can add comments
- [ ] Comments appear immediately
- [ ] Sorting works (Recent/Popular/Trending)
- [ ] Detail modal opens on click
- [ ] View counter increments

## Example Usage

### Sharing an NFT:
```javascript
// This is handled automatically by the UI
// But the API call looks like:
POST /api/shared-nfts
{
  "nftId": "68e94f2c...",
  "caption": "Just earned my first Legendary NFT! 🎉"
}
```

### Liking an NFT:
```javascript
// Click the heart icon, which calls:
POST /api/shared-nfts/[id]/like
// Response: { liked: true, likeCount: 15 }
```

### Adding a Comment:
```javascript
// Type in comment box and click Post:
POST /api/shared-nfts/[id]/comment
{
  "text": "Awesome NFT! Congrats! 👏"
}
```

## Next Steps

1. **Add to Navigation**: Make the gallery easily accessible
2. **Promote**: Encourage users to share their NFTs
3. **Monitor**: Check which NFTs get shared most
4. **Iterate**: Add more features based on user feedback

## Support

For issues or questions:
1. Check `NFT_SHARING_FEATURE.md` for detailed documentation
2. Review server logs for errors
3. Check browser console for frontend errors
4. Verify database collections exist (SharedNFT should auto-create)

## Quick Demo Flow

1. **Login** as a user
2. **Claim** an NFT from Available Campaigns
3. Go to **My NFTs** → See your NFT with the actual image
4. **Click** the NFT → Detail modal opens
5. **Click** "Share" button → Share modal opens
6. **Type** a caption: "My first NFT! 🎉"
7. **Click** "Share to Community" → Success!
8. Go to **Community Gallery** → See your NFT
9. **Like** some NFTs (click hearts)
10. **Comment** on NFTs
11. **Sort** by Popular/Trending/Recent
12. **Click** an NFT → See full details with all engagement

---

**That's it! You're all set up! 🚀**

The NFT sharing feature is ready to use. Users can now proudly display their achievements and engage with the community!
