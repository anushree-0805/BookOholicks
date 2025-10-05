# Bookoholics NFT Rewards - Integration Testing Guide

## Pre-requisites

### 1. Environment Setup

**Backend (.env)**
```env
U2U_RPC_URL=https://rpc-nebulas-testnet.uniultra.xyz
U2U_CHAIN_ID=2484
NFT_CONTRACT_ADDRESS=0xee2cbd200295a7ade7b0cd1ab7c7980fcdf9d240
PRIVATE_KEY=f798b2ab3ea76db828b0169e0589ee122f998b38e4c57bb2e4e23b876c8e4334
```

**Frontend (.env)**
```env
VITE_NFT_CONTRACT_ADDRESS=0xee2cbd200295a7ade7b0cd1ab7c7980fcdf9d240
VITE_U2U_RPC_URL=https://rpc-nebulas-testnet.uniultra.xyz
VITE_U2U_CHAIN_ID=2484
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install ethers@6
```

**Backend:**
```bash
cd server
npm install ethers@6
```

### 3. Initialize User Rewards

Run this script to set up reward tracking for all existing users:
```bash
cd server
npm run init-rewards
```

### 4. Start Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Testing Scenarios

### Scenario 1: Wallet Connection & NFT Minting

**Steps:**
1. Navigate to Dashboard → NFT Collection tab
2. Click "Connect Wallet" button
3. Approve MetaMask connection
4. Switch to U2U Testnet when prompted
5. Observe any existing off-chain NFTs being minted

**Expected Results:**
- ✅ Wallet connects successfully
- ✅ Network switches to U2U testnet
- ✅ Success message shows number of NFTs minted
- ✅ NFT collection displays blockchain indicators (⛓️)

**Check Database:**
```javascript
// MongoDB query
db.users.findOne({ userId: "your-user-id" })
// Should have walletAddress field populated
```

---

### Scenario 2: Reading Streak → Bronze Badge (7 days)

**Steps:**
1. Log reading sessions for 7 consecutive days:

```bash
# Day 1
curl -X POST http://localhost:5000/api/streaks/log-session \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "bookTitle": "1984",
    "minutesRead": 30,
    "pagesRead": 20
  }'

# Repeat for Days 2-7 with different book titles
```

2. On day 7, check rewards:
```bash
curl http://localhost:5000/api/rewards/your-user-id \
  -H "Authorization: Bearer <your-token>"
```

**Expected Results:**
- ✅ After 7 days: Bronze Reading Badge NFT earned
- ✅ Notification appears in UI
- ✅ NFT visible in collection
- ✅ If wallet connected: NFT minted on blockchain

**Verify on Blockchain:**
- Go to https://testnet.u2uscan.xyz/address/YOUR_WALLET_ADDRESS
- Check NFT balance

---

### Scenario 3: Posting Streak → Active Poster NFT

**Steps:**
1. Create posts on 7 consecutive days:

```bash
# Day 1
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Day 1: Just finished reading an amazing book!",
    "isPublic": true
  }'

# Repeat for Days 2-7
```

**Expected Results:**
- ✅ After 7 consecutive days: Active Poster NFT earned
- ✅ NFT appears in collection with ✍️ emoji
- ✅ Notification displays reward

---

### Scenario 4: Popular Opinion → 100 Likes

**Steps:**
1. Create a post:
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is going to be a popular post!",
    "isPublic": true
  }'
```

2. Get 100+ users to like the post (or simulate with script):
```bash
# Like the post (repeat 100 times with different users)
curl -X POST http://localhost:5000/api/posts/POST_ID/like \
  -H "Authorization: Bearer <user-token>"
```

**Expected Results:**
- ✅ At 100th like: Popular Opinion NFT earned
- ✅ NFT has ⭐ emoji
- ✅ Rarity: Epic

---

### Scenario 5: Community Explorer → First Join

**Steps:**
1. Join your first community:
```bash
curl -X POST http://localhost:5000/api/communities/COMMUNITY_ID/join \
  -H "Authorization: Bearer <your-token>"
```

**Expected Results:**
- ✅ Explorer NFT earned immediately
- ✅ NFT has 🧭 emoji
- ✅ Rarity: Common

---

### Scenario 6: Event Participation

**Steps:**
1. Create an event:
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "communityId": "COMMUNITY_ID",
    "title": "Book Club Meeting",
    "description": "Monthly book discussion",
    "startDate": "2025-10-15T18:00:00Z",
    "type": "virtual"
  }'
```

**Expected Results:**
- ✅ Event Organizer NFT earned
- ✅ NFT has 🎪 emoji

2. Join another user's event:
```bash
curl -X POST http://localhost:5000/api/events/EVENT_ID/join \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "going"}'
```

**Expected Results:**
- ✅ Event Participant NFT earned
- ✅ NFT has 🎫 emoji

---

### Scenario 7: NFT Redemption on Blockchain

**Steps:**
1. Go to Dashboard → NFT Collection
2. Click on an unredeemed NFT
3. Click "🎁 Redeem Benefits" button
4. Approve MetaMask transaction

**Expected Results:**
- ✅ Transaction submitted to blockchain
- ✅ NFT marked as redeemed in UI
- ✅ Database updated: `redeemed: true`
- ✅ Cannot redeem again

**Verify on Blockchain:**
```bash
# Check NFT metadata on-chain
curl -X POST https://rpc-nebulas-testnet.uniultra.xyz \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [{
      "to": "0xee2cbd200295a7ade7b0cd1ab7c7980fcdf9d240",
      "data": "0x..." // getMetadata(tokenId) encoded
    }, "latest"],
    "id": 1
  }'
```

---

### Scenario 8: Brand Dashboard Integration

**Steps:**
1. Login as brand account
2. Navigate to Brand Dashboard
3. Create a campaign with NFT rewards
4. Users complete campaign requirements

**Expected Results:**
- ✅ Brand can offer custom NFT rewards
- ✅ NFTs include brand name
- ✅ Users receive branded NFTs on completion

---

## Verification Checklist

### Database Checks

**Check Rewards:**
```javascript
db.rewards.find({ userId: "your-user-id" })
```

**Check NFTs:**
```javascript
db.nfts.find({ userId: "your-user-id" })
```

**Check User Wallet:**
```javascript
db.users.findOne({ userId: "your-user-id" }).walletAddress
```

### Blockchain Checks

1. **Contract Address:** https://testnet.u2uscan.xyz/address/0xee2cbd200295a7ade7b0cd1ab7c7980fcdf9d240

2. **User NFTs:** https://testnet.u2uscan.xyz/address/YOUR_WALLET_ADDRESS

3. **Transaction History:** Check all mint and redeem transactions

### API Endpoints to Test

```bash
# Get user rewards
GET /api/rewards/:userId

# Get user NFTs
GET /api/nfts/:userId

# Get blockchain NFTs
GET /api/blockchain/nfts/:userId

# Connect wallet
POST /api/blockchain/connect-wallet
Body: { "walletAddress": "0x..." }

# Redeem NFT
POST /api/blockchain/nfts/:tokenId/redeem

# Contract stats
GET /api/blockchain/stats
```

---

## Common Issues & Solutions

### Issue 1: NFTs not minting on blockchain
**Solution:**
- Check wallet has U2U testnet tokens (get from faucet)
- Verify contract address is correct
- Check private key has permission to mint
- Review server logs for errors

### Issue 2: Wallet won't connect
**Solution:**
- Install MetaMask extension
- Clear browser cache
- Try different browser
- Check if U2U testnet is configured correctly

### Issue 3: Rewards not triggering
**Solution:**
- Run `npm run init-rewards` to set up tracking
- Check server logs for errors
- Verify MongoDB connection
- Check if trigger conditions are met

### Issue 4: Wrong network error
**Solution:**
- Click "Switch Network" button
- Manually add U2U testnet to MetaMask:
  - Network Name: U2U Testnet
  - RPC: https://rpc-nebulas-testnet.uniultra.xyz
  - Chain ID: 2484
  - Symbol: U2U
  - Explorer: https://testnet.u2uscan.xyz

---

## Performance Testing

### Load Test NFT Minting
```bash
# Mint multiple NFTs
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/streaks/log-session \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d "{\"userId\": \"user$i\", \"bookTitle\": \"Book $i\", \"minutesRead\": 30, \"pagesRead\": 20}"
done
```

### Check System Performance
- Monitor MongoDB queries
- Check blockchain gas usage
- Review API response times
- Test with 100+ concurrent users

---

## Success Criteria

✅ All 9 reward types can be earned
✅ NFTs mint to blockchain when wallet connected
✅ Notifications display correctly
✅ NFTs appear in collection gallery
✅ Redemption works on blockchain
✅ Transaction links work
✅ No duplicate rewards
✅ Database and blockchain stay in sync
✅ Brand dashboard can create custom rewards
✅ System handles 100+ concurrent users

---

## Next Steps After Testing

1. **Deploy to Production:**
   - Deploy smart contract to U2U mainnet
   - Update environment variables
   - Test with real users

2. **Add IPFS Integration:**
   - Store NFT images on IPFS
   - Update token URI

3. **Implement Marketplace:**
   - Allow NFT trading
   - Add royalty system

4. **Add More Reward Types:**
   - Genre-specific achievements
   - Author collaborations
   - Limited edition events

---

## Support

For issues during testing:
1. Check server logs: `cd server && npm run dev`
2. Check browser console
3. Review MongoDB collections
4. Check U2U testnet explorer
5. Refer to MODULE_4_IMPLEMENTATION.md

Happy Testing! 🎉
