# Complete Campaign to NFT Claim Workflow

## ✅ Implementation Complete!

All features are now implemented. Here's the complete workflow:

---

## 🎯 Workflow Steps

### 1️⃣ BRAND: Create Campaign
**Location:** `/brand-dashboard` → Campaigns tab → Create Campaign button

1. Fill out campaign wizard (4 steps)
2. For **phygital campaigns**: Check "Enable Physical Item Redemption" and fill details
3. Click "Create Campaign"
4. ✅ Campaign saved to database with status: `draft`

---

### 2️⃣ BRAND: Submit for Approval
**Location:** `/brand-dashboard` → Campaigns tab

1. Find your draft campaign
2. Click **"📝 Submit for Approval"** button
3. ✅ Campaign status changes to: `pending_approval`
4. Wait for admin review

---

### 3️⃣ ADMIN: Approve Campaign
**Location:** `/admin` (Admin Dashboard)

1. See all pending campaigns
2. Review campaign details:
   - Brand name
   - Description
   - Total supply
   - Phygital status
   - Benefits
3. Click **"✓ Approve"** or **"✗ Reject"**
4. ✅ If approved, campaign status changes to: `approved`

---

### 4️⃣ BRAND: Pre-Mint NFTs (Phygital Only)
**Location:** `/brand-dashboard` → Campaigns tab

1. Find your approved campaign
2. Click **"🔨 Pre-Mint NFTs"** button
3. Enter escrow wallet address (or use default platform wallet)
4. Wait for blockchain transaction
5. ✅ NFTs are minted to escrow wallet
6. ✅ `campaign.blockchain.preMinted = true`
7. ✅ `campaign.blockchain.tokenIds = [...]` (array of minted token IDs)

**What happens on blockchain:**
- Smart contract's `batchMintToEscrow()` function is called
- `totalSupply` NFTs are minted to the escrow wallet
- Each NFT gets a unique token ID
- Token IDs are stored in the campaign document

---

### 5️⃣ BRAND: Activate Campaign
**Location:** `/brand-dashboard` → Campaigns tab

1. After pre-minting completes, see "✅ X NFTs Pre-Minted" message
2. Click **"🚀 Activate Campaign"** button
3. ✅ Campaign status changes to: `active`
4. ✅ Campaign appears on user-facing `/campaigns` page

---

### 6️⃣ USERS: Browse Active Campaigns
**Location:** `/campaigns` (Active Campaigns page)

Users can see:
- All active campaigns
- NFT image/emoji
- Campaign name & description
- Rarity level
- Progress bar (claimed/total supply)
- Phygital badge (if applicable)
- Benefits list
- "Claim NFT" button

---

### 7️⃣ USERS: Claim NFT
**Location:** `/campaigns` → Click "Claim NFT" button

1. User clicks **"Claim NFT"**
2. System checks eligibility:
   - User not already claimed
   - NFTs still available
   - Campaign is active
3. If eligible, claim process starts:
   - Creates `CampaignClaim` record
   - Creates off-chain NFT in database
   - Gets next available token ID from `campaign.blockchain.tokenIds`
   - Calls `blockchainService.transferFromEscrow()`
   - **Transfers NFT from escrow wallet to user's wallet**
   - Updates NFT with on-chain data (tokenId, transactionHash)
   - Increments `campaign.claimed`
4. ✅ User receives NFT in their wallet
5. Success message shows transaction hash

**What happens on blockchain:**
- Smart contract's `transferFromEscrow()` function is called
- NFT ownership transfers from escrow wallet to user wallet
- User can see NFT in their wallet immediately

---

### 8️⃣ USERS: View NFT Collection
**Location:** `/dashboard` → NFT Collection tab

Users can see:
- All their claimed NFTs
- Campaign NFTs with metadata
- Achievement NFTs (streaks, etc.)
- Phygital NFTs have redemption option

---

### 9️⃣ USERS: Redeem Physical Item (Phygital Only)
**Location:** `/dashboard` → NFT Collection → Phygital NFT

1. User clicks "Request Redemption"
2. Fills shipping address form
3. Submits request
4. ✅ `CampaignClaim.physicalRedemption.status = 'pending'`

---

### 🔟 BRAND: Fulfill Physical Orders
**Location:** `/brand-dashboard` → Campaign Details → Redemptions

1. See all redemption requests
2. Update status: `processing` → `shipped` → `delivered`
3. Add tracking number
4. When marked as delivered:
   - ✅ NFT is marked as `redeemed: true`
   - Cannot be redeemed again

---

## 📊 Campaign Status Flow

```
draft
  ↓ (Brand clicks "Submit for Approval")
pending_approval
  ↓ (Admin clicks "Approve")
approved
  ↓ (Brand clicks "Pre-Mint NFTs" - Phygital only)
approved (with preMinted = true)
  ↓ (Brand clicks "Activate Campaign")
active
  ↓ (Users can claim NFTs)
active (claimed count increases)
  ↓ (All NFTs claimed or end date reached)
completed
```

---

## 🔑 Key Routes

| Route | Purpose | Who |
|-------|---------|-----|
| `/brand-dashboard` | Manage campaigns | Brands |
| `/admin` | Approve campaigns | Admins |
| `/campaigns` | Browse & claim NFTs | Users |
| `/dashboard` | View NFT collection | Users |

---

## 🎨 UI Indicators

### Campaign Manager (Brand)
- **Draft**: Blue "Submit for Approval" button
- **Pending Approval**: Yellow "Waiting for Admin" badge
- **Approved (not pre-minted)**: Purple "Pre-Mint NFTs" button
- **Approved (pre-minted)**: Green badge + "Activate Campaign" button
- **Active**: Green "Campaign is Live!" badge + Pause option

### Active Campaigns (Users)
- **Available**: Green "Claim NFT" button
- **Already Claimed**: Red "Already Claimed" disabled button
- **Sold Out**: Gray "Sold Out" disabled button
- **Not Signed In**: Gray "Sign in to claim" disabled button

---

## 🔧 Technical Flow

### Campaign Creation
```javascript
POST /api/campaigns
Body: { brandId, brandName, campaignName, ... }
→ MongoDB: Campaign document created (status: 'draft')
```

### Submit for Approval
```javascript
POST /api/campaigns/:id/submit-for-approval
→ MongoDB: campaign.status = 'pending_approval'
```

### Admin Approval
```javascript
POST /api/campaigns/:id/approve
Body: { adminUserId }
→ MongoDB: campaign.status = 'approved'
→ MongoDB: campaign.approvedBy = adminUserId
→ MongoDB: campaign.approvedAt = Date
```

### Pre-Mint NFTs
```javascript
POST /api/campaigns/:id/pre-mint
Body: { escrowWallet: '0x...' }

Backend:
→ blockchainService.batchMintToEscrow(escrowWallet, totalSupply, nftData)
→ Smart Contract: batchMintToEscrow() mints NFTs
→ MongoDB: campaign.blockchain.preMinted = true
→ MongoDB: campaign.blockchain.tokenIds = [1, 2, 3, ...]
→ MongoDB: campaign.blockchain.escrowWallet = escrowWallet
→ MongoDB: campaign.minted = totalSupply
```

### Activate Campaign
```javascript
PATCH /api/campaigns/:id/status
Body: { status: 'active' }
→ MongoDB: campaign.status = 'active'
```

### User Claims NFT
```javascript
POST /api/campaign-claims/:campaignId/claim

Backend:
1. Check eligibility
2. Get user's wallet address
3. Get next available tokenId from campaign.blockchain.tokenIds
4. blockchainService.transferFromEscrow(escrowWallet, userWallet, tokenId)
5. Smart Contract: transferFromEscrow() transfers NFT
6. Create NFT in database
7. Create CampaignClaim record
8. Increment campaign.claimed
→ User receives NFT in wallet
```

---

## 🚀 Testing Checklist

### Brand Flow
- [ ] Create campaign → Saves as draft
- [ ] Submit for approval → Status changes to pending
- [ ] See "Waiting for approval" badge

### Admin Flow
- [ ] Go to `/admin`
- [ ] See pending campaign
- [ ] Approve campaign → Status changes to approved

### Brand Pre-Mint Flow
- [ ] See "Pre-Mint NFTs" button
- [ ] Click pre-mint
- [ ] Enter escrow wallet (or use default)
- [ ] Wait for transaction
- [ ] See "X NFTs Pre-Minted" message
- [ ] See "Activate Campaign" button

### Brand Activation Flow
- [ ] Click "Activate Campaign"
- [ ] Status changes to active
- [ ] See "Campaign is Live!" badge

### User Claim Flow
- [ ] Go to `/campaigns`
- [ ] See active campaign
- [ ] Click "Claim NFT"
- [ ] Transaction processes
- [ ] Receive success message with tx hash
- [ ] NFT appears in `/dashboard`
- [ ] Button changes to "Already Claimed"

---

## 📝 Environment Variables Needed

### Backend (.env)
```
NFT_CONTRACT_ADDRESS=0x... (Your deployed contract address)
U2U_RPC_URL=https://rpc-nebulas-testnet.uniultra.xyz
PRIVATE_KEY=0x... (Platform wallet private key for executing transactions)
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🎉 You're Ready!

The complete workflow is now implemented:

1. ✅ Brand creates campaign
2. ✅ Brand submits for approval
3. ✅ Admin approves campaign
4. ✅ Brand pre-mints NFTs to escrow
5. ✅ Brand activates campaign
6. ✅ Users browse active campaigns
7. ✅ Users claim NFTs (auto-transfer from escrow)
8. ✅ NFTs appear in user collection

**Next:** Test the complete flow end-to-end!
