# User Campaign Claim Flow - Complete Guide

## Overview
Users can now view active campaigns and claim NFTs if they meet the eligibility requirements. The system automatically checks eligibility before allowing claims.

## How It Works

### 1. View Active Campaigns
**URL**: `/campaigns`

Users see a grid of all active campaigns with:
- Campaign name and description
- Rarity level (Common, Rare, Epic, Legendary, Mythic)
- Progress bar showing claimed/total supply
- Benefits and rewards
- Eligibility status
- Claim button (if eligible)

### 2. Eligibility Checking

The system automatically checks if users meet the requirements:

#### Campaign Types & Requirements:

**Open (No Requirements)**
```
✅ Everyone can claim
```

**Community-Based**
```
Requirements:
- Must be member of specific community
- Optional: Minimum posts in that community

Example: "Join Book Lovers community and make 5 posts"
```

**Engagement-Based**
```
Requirements:
- Minimum total posts across all communities
- Post with minimum number of likes
- Minimum comments received

Example: "Have 10 total posts and 1 post with 50+ likes"
```

**Reading Streak-Based**
```
Requirements:
- Maintain X consecutive days of reading

Example: "Maintain a 7-day reading streak"
```

**Event-Based**
```
Requirements:
- Must attend specific event

Example: "Attend the Author Meet & Greet event"
```

**Purchase-Based**
```
Requirements:
- Minimum purchase amount

Example: "Purchase $50 worth of books"
Note: Currently returns eligible=true (implementation pending)
```

### 3. Claiming Process

When user clicks "Claim NFT":

1. **Pre-Claim Validation**
   - Check if campaign is still active
   - Check if NFTs are still available
   - Re-verify eligibility
   - Check if user already claimed
   - Verify user has wallet connected

2. **NFT Distribution** (Two Methods)

   **Method A: Pre-Minted (Phygital Campaigns)**
   - Transfer NFT from escrow wallet to user
   - Faster transaction
   - Already on blockchain

   **Method B: On-Demand Minting (Regular Campaigns)**
   - Mint new NFT directly to user's wallet
   - Slightly slower but more flexible

3. **Post-Claim Actions**
   - Create off-chain NFT record in database
   - Update on-chain with blockchain data
   - Increment campaign's claimed counter
   - Show success message with transaction hash

### 4. Success Confirmation

After successful claim:
- ✅ Success message displayed
- 🔗 Transaction hash with link to block explorer
- 📦 NFT added to user's collection
- 🔄 Campaign progress updated

## API Endpoints Used

### Get Active Campaigns
```http
GET /api/campaigns/active/all
```
Returns all campaigns with status='active'

### Check Eligibility
```http
GET /api/campaigns/:campaignId/check-eligibility/:userId
```
Response:
```json
{
  "eligible": true,
  "reason": "Open to all users"
}
```

### Claim NFT
```http
POST /api/campaign-claims/:campaignId/claim
```
Headers: `Authorization: Bearer <token>`

Response (Success):
```json
{
  "message": "NFT claimed successfully",
  "claim": { /* claim details */ },
  "nft": { /* NFT details */ },
  "transactionHash": "0x..."
}
```

Response (Error):
```json
{
  "message": "Not eligible for this campaign",
  "reason": "You need a 7-day reading streak. Current: 3 days."
}
```

## User Flow Example

### Scenario: Claiming a Community Campaign

1. **User navigates to /campaigns**
   - Sees "Book Club Rewards" campaign
   - Shows: "🔒 Not Eligible"
   - Reason: "You must join the required community first"

2. **User joins the community**
   - Navigates to /communities
   - Joins "Book Lovers Club"
   - Makes required number of posts

3. **User returns to /campaigns**
   - Campaign now shows: "🔓 Community requirements met"
   - "Claim NFT" button is now active

4. **User clicks "Claim NFT"**
   - Confirmation modal appears
   - Shows campaign details and benefits
   - User confirms claim

5. **System processes claim**
   - Shows "Claiming..." spinner
   - Mints/transfers NFT on blockchain
   - Transaction completes

6. **Success!**
   - "🎉 Success!" message
   - Transaction hash displayed
   - Link to view on block explorer
   - NFT appears in user's collection

## Testing the Flow

### Test Case 1: Open Campaign (No Requirements)
```
1. Navigate to /campaigns
2. Find campaign with "Open to all users"
3. Click "Claim NFT"
4. Should succeed immediately
```

### Test Case 2: Community Campaign
```
1. Create campaign with community requirement
2. As user, try to claim → Should fail
3. Join required community
4. Make required posts (if any)
5. Try to claim again → Should succeed
```

### Test Case 3: Already Claimed
```
1. Claim an NFT successfully
2. Refresh page
3. Try to claim same campaign again
4. Should show "You have already claimed this campaign"
```

### Test Case 4: Sold Out Campaign
```
1. Create campaign with small supply (e.g., 2 NFTs)
2. Claim with 2 different users
3. Third user tries to claim
4. Should show "Sold Out"
```

## Frontend Components

### ActiveCampaigns.jsx (Main Page)
Location: `src/pages/ActiveCampaigns.jsx`

Features:
- Displays all active campaigns in grid
- Real-time eligibility checking
- Responsive design
- Loading states
- Error handling

### CampaignCard (Individual Campaign)
Embedded in ActiveCampaigns.jsx

Features:
- Campaign image/icon
- Name, type, rarity
- Description
- Progress bar
- Benefits list
- Phygital badge (if applicable)
- Eligibility status
- Claim button

## Error Handling

### Common Errors & Messages

**"Campaign not found"**
- Campaign ID is invalid or deleted

**"Campaign is not active"**
- Campaign status is not 'active'

**"No NFTs remaining"**
- Campaign supply exhausted

**"Not eligible for this campaign"**
- User doesn't meet requirements
- Shows specific reason

**"You have already claimed this campaign"**
- User already claimed once

**"Please connect your wallet first"**
- User doesn't have wallet address set

**"Failed to mint/transfer NFT"**
- Blockchain transaction failed
- Check wallet balance, gas, etc.

## Monitoring & Analytics

Campaigns track:
- `claimed` - Number of NFTs claimed
- `analytics.completions` - Successful claims
- `analytics.views` - Campaign views
- `analytics.conversionRate` - Claimed/Minted ratio

## Smart Contract Integration

### Pre-Minted Campaigns
Uses: `transferFromEscrow(from, to, tokenId)`
- Faster
- Lower gas per claim
- Limited to 100 NFTs (gas constraints)

### On-Demand Campaigns
Uses: `mintNFT(to, metadata)`
- Flexible
- No pre-mint required
- Unlimited supply possible

## Database Models

### CampaignClaim
```javascript
{
  campaignId: ObjectId,
  userId: String,
  nftId: ObjectId,
  tokenId: String,
  status: 'pending' | 'claimed' | 'transferred' | 'failed',
  transferTransactionHash: String,
  errorMessage: String,
  claimedAt: Date
}
```

### NFT
```javascript
{
  userId: String,
  name: String,
  image: String,
  category: String,
  rarity: String,
  description: String,
  benefits: [String],
  brand: String,
  tokenId: String,
  transactionHash: String,
  blockNumber: Number,
  onChain: Boolean
}
```

## Next Steps

1. **Test the complete flow**
   - Create a test campaign
   - Submit for approval (admin)
   - Approve it
   - Pre-mint NFTs (if <100)
   - Activate campaign
   - Claim as user

2. **Verify on blockchain**
   - Check transaction on U2U explorer
   - Verify NFT ownership
   - Confirm metadata

3. **Test eligibility logic**
   - Test each eligibility type
   - Verify error messages
   - Check edge cases

4. **Monitor for issues**
   - Check server logs
   - Monitor blockchain transactions
   - Track claim success rates

## Troubleshooting

**Campaign not appearing in /campaigns?**
- Check campaign status is 'active'
- Verify startDate <= now
- Check endDate > now (if set)

**Eligibility always showing false?**
- Check eligibility service logs
- Verify user data (posts, streaks, etc.)
- Test with 'open' eligibility first

**Claim fails with "Wallet not connected"?**
- User needs to set `walletAddress` in their User document
- Implement wallet connection UI

**Transaction fails?**
- Check wallet has U2U tokens for gas
- Verify smart contract is deployed
- Check blockchain service is initialized

## Success Indicators

✅ Users can see active campaigns
✅ Eligibility checking works correctly
✅ Eligible users can claim NFTs
✅ Transaction completes on blockchain
✅ NFT appears in user's collection
✅ Campaign counters update correctly
✅ Error messages are clear and helpful
