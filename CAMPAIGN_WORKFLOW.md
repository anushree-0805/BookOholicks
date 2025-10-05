# 🚀 Complete Campaign Workflow

## Your Campaign is in DRAFT - Here's What to Do Next:

### Step 1: Submit for Approval (Brand Dashboard)
1. Go to `http://localhost:3000/brand-dashboard`
2. Click "Campaigns" tab
3. Find your draft campaign
4. Click **"📝 Submit for Approval"** button
5. ✅ Status → `pending_approval`

### Step 2: Admin Approves (Admin Dashboard)
1. Go to `http://localhost:3000/admin`
2. See your pending campaign
3. Review details
4. Click **"✓ Approve"** button
5. ✅ Status → `approved`

### Step 3: Pre-Mint NFTs (Brand Dashboard)
1. Refresh `/brand-dashboard`
2. Click **"🔨 Pre-Mint NFTs"** button
3. Enter escrow wallet (or press OK for default)
4. Wait 10-30 seconds for blockchain
5. ✅ See "X NFTs Pre-Minted" message

### Step 4: Activate Campaign (Brand Dashboard)
1. Click **"🚀 Activate Campaign"** button
2. ✅ Status → `active`
3. ✅ Campaign visible at `/campaigns`

### Step 5: Users Claim NFTs
1. Go to `http://localhost:3000/campaigns`
2. See your active campaign
3. Sign in (use different account than brand)
4. Click **"Claim NFT"** button
5. ✅ NFT transferred to user wallet!

## Quick URLs
- Brand: `http://localhost:3000/brand-dashboard`
- Admin: `http://localhost:3000/admin`
- Users: `http://localhost:3000/campaigns`
- Collection: `http://localhost:3000/dashboard`

## Status Flow
```
draft → pending_approval → approved → (pre-mint) → active
```

**Start with Step 1!** 🚀
