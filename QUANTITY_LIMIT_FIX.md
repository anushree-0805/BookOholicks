# Pre-Mint Quantity Limit Fix

## Problem

When trying to pre-mint NFTs for a campaign, you got this error:
```
❌ Error batch minting to escrow: execution reverted: "Invalid quantity"
```

The issue occurred when trying to mint **999,999 NFTs** (from an "unlimited" campaign).

## Root Cause

The smart contract has a **maximum batch size limit of 100 NFTs** to prevent gas limit issues:

```solidity
// From BookoholicsNFT_Fixed.sol and BookoholicsNFT_Optimized.sol
require(quantity > 0 && quantity <= 100, "Invalid quantity");
```

This is a blockchain constraint due to:
- **Gas limits** - Large batch minting operations consume too much gas
- **Block gas limits** - Transactions can't exceed the block gas limit
- **Transaction costs** - Large batches would be prohibitively expensive

## Fixes Applied

### 1. Backend Validation (server/routes/campaigns.js:348-373)

Added three levels of validation before attempting pre-mint:

#### a) Block Unlimited Campaigns
```javascript
if (campaign.unlimited) {
  return res.status(400).json({
    message: 'Cannot pre-mint unlimited campaigns',
    details: 'Unlimited campaigns should mint NFTs on-demand when claimed, not pre-minted to escrow'
  });
}
```

#### b) Check Batch Size Limit
```javascript
const MAX_BATCH_SIZE = 100;
if (campaign.totalSupply > MAX_BATCH_SIZE) {
  return res.status(400).json({
    message: `Cannot pre-mint more than ${MAX_BATCH_SIZE} NFTs in a single batch`,
    details: `Your campaign has ${campaign.totalSupply} NFTs. The smart contract limits batch minting to ${MAX_BATCH_SIZE} NFTs due to gas constraints.`,
    currentSupply: campaign.totalSupply,
    maxAllowed: MAX_BATCH_SIZE
  });
}
```

#### c) Validate Minimum Quantity
```javascript
if (campaign.totalSupply < 1) {
  return res.status(400).json({
    message: 'Total supply must be at least 1',
    currentSupply: campaign.totalSupply
  });
}
```

### 2. Frontend Warning - Campaign Manager (CampaignManager.jsx:337-349)

Added visual warnings in the campaign list:

```jsx
{/* Show warning for unlimited campaigns */}
{campaign.unlimited && (
  <div className="w-full px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-center text-xs">
    ⚠️ Unlimited campaigns cannot be pre-minted. NFTs will be minted on-demand when claimed.
  </div>
)}

{/* Show warning for large campaigns */}
{!campaign.unlimited && campaign.totalSupply > 100 && (
  <div className="w-full px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-center text-xs">
    ⚠️ Campaign exceeds 100 NFT limit. Cannot pre-mint. Please reduce supply or contact support.
  </div>
)}
```

The Pre-Mint button now only shows for campaigns with 1-100 NFTs:
```jsx
{!campaign.blockchain?.preMinted && !campaign.unlimited && campaign.totalSupply <= 100 ? (
  <button onClick={() => handlePreMint(campaign)}>
    🔨 Pre-Mint {campaign.totalSupply} NFT{campaign.totalSupply !== 1 ? 's' : ''}
  </button>
) : null}
```

### 3. Frontend Warning - Campaign Wizard (CampaignWizard.jsx:433-443)

Added real-time warning when creating campaigns with more than 100 NFTs:

```jsx
{campaignData.totalSupply > 100 && (
  <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
    ⚠️ <strong>Warning:</strong> The smart contract limits batch pre-minting to 100 NFTs due to gas constraints.
    For campaigns with more than 100 NFTs, you'll need to either:
    <ul className="list-disc ml-5 mt-2">
      <li>Reduce the supply to 100 or less</li>
      <li>Use on-demand minting (not pre-minted)</li>
      <li>Contact support for custom solutions</li>
    </ul>
  </div>
)}
```

Also added:
- `max="100"` attribute on the input field
- Help text: "Recommended: 1-100 NFTs for pre-minting"

## Campaign Types & Pre-Minting

### ✅ Can Be Pre-Minted (1-100 NFTs)
- **Phygital campaigns** with limited supply (≤100)
- **Reward campaigns** with limited supply (≤100)
- **Access campaigns** with limited supply (≤100)
- **Achievement campaigns** with limited supply (≤100)

### ❌ Cannot Be Pre-Minted
- **Unlimited campaigns** - Should mint on-demand
- **Large campaigns** (>100 NFTs) - Exceeds gas limits

### 🔄 Alternative for Large Campaigns
For campaigns requiring more than 100 NFTs:

1. **On-Demand Minting**
   - Mint NFTs when users claim them
   - No upfront gas costs
   - Scalable to any quantity

2. **Multiple Batches** (Future Feature)
   - Split into multiple pre-mint transactions
   - Each batch ≤100 NFTs
   - Requires additional logic to manage multiple escrow pools

3. **Contact Support**
   - Custom solutions for enterprise clients
   - Potential smart contract upgrades
   - Alternative distribution methods

## How to Fix Your Current Campaign

Your campaign "join our community" has these settings:
- **Unlimited**: true
- **Total Supply**: 999,999

### Option 1: Use On-Demand Minting (Recommended for Unlimited)
1. Keep the campaign as "unlimited"
2. Skip the pre-mint step
3. Activate the campaign directly
4. NFTs will be minted when users claim them

### Option 2: Convert to Limited Supply
1. Edit the campaign
2. Uncheck "Unlimited Supply"
3. Set Total Supply to a number between 1-100
4. Re-submit for approval
5. Pre-mint after approval

## Testing

Try creating a new campaign with these settings:

### ✅ This Should Work:
```
Campaign Name: Test Reward
Type: reward
Total Supply: 50
Unlimited: false
```

### ❌ This Should Show Warning:
```
Campaign Name: Large Campaign
Type: reward
Total Supply: 500
Unlimited: false
```
→ Should show: "Cannot pre-mint more than 100 NFTs"

### ❌ This Should Block Pre-Mint:
```
Campaign Name: Unlimited Badges
Type: achievement
Unlimited: true
```
→ Should show: "Unlimited campaigns cannot be pre-minted"

## Summary

**What Changed:**
1. ✅ Backend validates quantity limits (1-100)
2. ✅ Backend blocks unlimited campaigns from pre-minting
3. ✅ Frontend shows warnings for large/unlimited campaigns
4. ✅ Frontend hides pre-mint button when not applicable
5. ✅ Campaign wizard warns users during creation

**Files Modified:**
- `server/routes/campaigns.js` - Added validation
- `src/components/brand/CampaignManager.jsx` - Added warnings & conditional button
- `src/components/brand/CampaignWizard.jsx` - Added creation-time warnings

**Smart Contract Limit:**
- Maximum: **100 NFTs per batch**
- Minimum: **1 NFT**
- This cannot be changed without redeploying the contract
