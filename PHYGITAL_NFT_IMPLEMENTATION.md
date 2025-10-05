# Phygital NFT Campaign Implementation

## Overview
Implementation of brand-created phygital NFT campaigns with physical item redemption.

## Architecture

### Two NFT Flows:

#### 1. **Non-Phygital NFTs** (Achievement-based)
- Auto-minted by platform when users earn achievements
- Direct mint to user's wallet
- Examples: Streak badges, community achievements

#### 2. **Phygital NFTs** (Campaign-based)
- Pre-minted by platform to brand's escrow wallet
- Transferred to users upon claim
- Redeemable for physical items

---

## Implementation Details

### 1. Database Models

#### Campaign Model (`server/models/Campaign.js`)
- **Campaign info**: name, description, brand, dates
- **NFT details**: image, rarity, category, benefits, supply
- **Phygital settings**:
  - `physicalItem`: name, description, images, value, shipping info
  - `eligibility`: type, requirements, description
- **Blockchain tracking**:
  - `blockchain.preMinted`: boolean
  - `blockchain.tokenIds`: array of pre-minted token IDs
  - `blockchain.escrowWallet`: wallet holding NFTs
- **Status workflow**: draft → pending_approval → approved → active
- **Analytics**: views, participants, completions, conversion rate

#### CampaignClaim Model (`server/models/CampaignClaim.js`)
- Tracks user claims per campaign
- **Claim status**: pending → claimed/transferred → failed
- **Physical redemption**:
  - Request status: not_requested → pending → processing → shipped → delivered
  - Shipping address
  - Tracking number
  - Delivery timestamps

---

### 2. Smart Contract Updates

#### New Functions in `BookoholicsNFT.sol`

**Pre-minting Functions:**
```solidity
function mintToEscrow(address escrowWallet, ...) // Mint single NFT to escrow
function batchMintToEscrow(address escrowWallet, uint256 quantity, ...) // Batch pre-mint
```

**Transfer Functions:**
```solidity
function transferFromEscrow(address from, address to, uint256 tokenId) // Transfer NFT
function batchTransferFromEscrow(...) // Batch transfer
```

**Key Differences:**
- No duplicate reward check for phygital NFTs
- Mints to escrow wallet instead of end user
- Owner-only transfer from escrow

---

### 3. Blockchain Service Updates

#### New Methods (`server/services/blockchainService.js`)

```javascript
batchMintToEscrow(escrowWallet, quantity, nftData)
// Pre-mints NFTs for campaign, returns tokenIds array

transferFromEscrow(escrowWallet, userWallet, tokenId)
// Transfers specific NFT to claiming user
```

**Updated ABI:**
- Added mintToEscrow and batchMintToEscrow
- Added transferFromEscrow functions

---

### 4. API Endpoints

#### Campaign Management (`/api/campaigns`)

**Brand Workflow:**
```
POST   /                              Create campaign (draft)
POST   /:id/submit-for-approval       Submit for admin review
POST   /:id/approve                   Admin approves (admin only)
POST   /:id/reject                    Admin rejects (admin only)
POST   /:id/pre-mint                  Pre-mint NFTs to escrow
PATCH  /:id/status                    Update status (activate)
GET    /active/all                    Get all active campaigns
GET    /:id/check-eligibility/:userId Check user eligibility
```

#### Campaign Claims (`/api/campaign-claims`)

**User Flow:**
```
POST   /:campaignId/claim             Claim NFT from campaign
GET    /user/:userId                  Get user's claims
GET    /:claimId                      Get claim details
GET    /campaign/:campaignId/all      Get all claims (brand view)
```

#### Physical Redemption (`/api/physical-redemption`)

**Redemption Workflow:**
```
POST   /claims/:claimId/request-redemption    User requests physical item
PATCH  /claims/:claimId/redemption-status     Brand updates status
POST   /claims/:claimId/cancel-redemption     User cancels request

GET    /campaign/:campaignId/redemptions      Get all redemptions (brand)
GET    /user/:userId/redemptions              Get user's redemptions
GET    /campaign/:campaignId/stats            Redemption statistics
```

---

## User Flows

### Brand Creates Phygital Campaign

1. **Brand creates campaign** (draft status)
   ```
   POST /api/campaigns
   {
     "campaignType": "phygital",
     "campaignName": "Limited Edition Book Bundle",
     "totalSupply": 100,
     "physicalItem": {
       "enabled": true,
       "name": "Signed First Edition + Bookmark",
       "estimatedValue": 50
     },
     "eligibility": { "type": "open" }
   }
   ```

2. **Submit for approval**
   ```
   POST /api/campaigns/:id/submit-for-approval
   ```

3. **Admin approves**
   ```
   POST /api/campaigns/:id/approve
   ```

4. **Pre-mint NFTs to escrow**
   ```
   POST /api/campaigns/:id/pre-mint
   { "escrowWallet": "0x..." }
   ```
   - Mints 100 NFTs to brand's escrow wallet
   - Stores tokenIds in campaign.blockchain.tokenIds

5. **Activate campaign**
   ```
   PATCH /api/campaigns/:id/status
   { "status": "active" }
   ```

### User Claims Phygital NFT

1. **User sees active campaign**
   ```
   GET /api/campaigns/active/all
   ```

2. **User claims NFT**
   ```
   POST /api/campaign-claims/:campaignId/claim
   ```
   - Verifies user hasn't claimed before
   - Gets next available tokenId from campaign.blockchain.tokenIds
   - **Transfers NFT** from escrow to user's wallet
   - Creates CampaignClaim record
   - Updates campaign.claimed counter

3. **User requests physical redemption**
   ```
   POST /api/physical-redemption/claims/:claimId/request-redemption
   {
     "shippingAddress": {
       "fullName": "John Doe",
       "addressLine1": "123 Main St",
       "city": "NYC",
       "postalCode": "10001",
       "country": "USA"
     }
   }
   ```

4. **Brand processes fulfillment**
   ```
   PATCH /api/physical-redemption/claims/:claimId/redemption-status
   { "status": "processing" }

   PATCH /api/physical-redemption/claims/:claimId/redemption-status
   {
     "status": "shipped",
     "trackingNumber": "1Z999AA10123456784"
   }

   PATCH /api/physical-redemption/claims/:claimId/redemption-status
   { "status": "delivered" }
   ```
   - When status = "delivered", NFT is marked as redeemed

---

## Key Differences: Phygital vs Non-Phygital

| Aspect | Non-Phygital | Phygital |
|--------|-------------|----------|
| **Creation** | Auto-generated by platform | Brand-created campaigns |
| **Approval** | No approval needed | Admin approval required |
| **Minting** | Mint directly to user | Pre-mint to escrow, transfer later |
| **Distribution** | On achievement | User claims from campaign |
| **Physical Item** | No | Yes, with shipping tracking |
| **Quantity** | One per reward type per user | Limited supply per campaign |
| **Blockchain** | Single mint transaction | Batch pre-mint + individual transfers |

---

## Status Workflows

### Campaign Status Flow:
```
draft → pending_approval → approved → active → completed/cancelled
```

### Claim Status Flow:
```
pending → claimed/transferred → (with physical redemption)
```

### Physical Redemption Status Flow:
```
not_requested → pending → processing → shipped → delivered
                                    ↓
                                cancelled
```

---

## Next Steps for Deployment

1. **Deploy Updated Smart Contract**
   ```bash
   cd contracts
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network u2u-testnet
   ```
   - Update `NFT_CONTRACT_ADDRESS` in server/.env

2. **Create Escrow Wallets**
   - Generate secure wallets for brands
   - Fund with gas for transfers

3. **Add Admin Authentication**
   - Implement admin middleware for approval endpoints
   - Add brand ownership verification

4. **Testing**
   - Test pre-minting flow
   - Test claim and transfer
   - Test physical redemption workflow

5. **Frontend Integration**
   - Brand dashboard for campaign creation
   - User campaign browsing and claiming
   - Redemption request forms
   - Order tracking UI

---

## Files Modified/Created

### Models:
- ✅ `server/models/Campaign.js` - Updated with phygital fields
- ✅ `server/models/CampaignClaim.js` - NEW

### Routes:
- ✅ `server/routes/campaigns.js` - Added phygital endpoints
- ✅ `server/routes/campaignClaims.js` - NEW
- ✅ `server/routes/physicalRedemption.js` - NEW

### Services:
- ✅ `server/services/blockchainService.js` - Added escrow functions

### Smart Contract:
- ✅ `contracts/BookoholicsNFT.sol` - Added pre-mint & transfer functions

### Server:
- ✅ `server/server.js` - Registered new routes

---

## Example API Usage

See implementation complete! Test with:

```bash
# 1. Create campaign
curl -X POST http://localhost:5000/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"campaignType":"phygital",...}'

# 2. Approve & pre-mint
curl -X POST http://localhost:5000/api/campaigns/ID/pre-mint \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"escrowWallet":"0x..."}'

# 3. User claims
curl -X POST http://localhost:5000/api/campaign-claims/CAMPAIGN_ID/claim \
  -H "Authorization: Bearer USER_TOKEN"
```

---

**Implementation Status: ✅ COMPLETE**

All 5 tasks completed:
1. ✅ Campaign model with phygital support
2. ✅ Smart contract pre-minting & transfers
3. ✅ Campaign management routes
4. ✅ NFT claim/transfer logic
5. ✅ Physical redemption tracking
