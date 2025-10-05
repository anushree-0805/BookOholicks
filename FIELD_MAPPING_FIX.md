# Field Mapping Fix - CampaignManager

## Error Fixed
```
Uncaught TypeError: Cannot read properties of undefined (reading 'toLowerCase')
at CampaignManager.jsx:112
```

## Root Cause
Database schema uses different field names than the mock data:
- Database: `campaignName`, `campaignType`, `distributionMethod`
- Mock data: `name`, `type`, `distribution`

## Changes Made

### 1. Search Filter (Line 112)
**Before:**
```javascript
const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
```

**After:**
```javascript
const campaignName = campaign.campaignName || campaign.name || '';
const matchesSearch = campaignName.toLowerCase().includes(searchTerm.toLowerCase());
```

### 2. Stats Display (Lines 187-225)
**Before:**
```javascript
{campaign.minted}
{campaign.claimed}
{campaign.redeemed}
{campaign.claimed}/{campaign.totalSupply}
{(campaign.claimed / campaign.totalSupply) * 100}%
{campaign.distribution.replace('_', ' ')}
{campaign.conversionRate}%
```

**After:**
```javascript
{campaign.minted || 0}
{campaign.claimed || 0}
{campaign.redeemed || 0}
{campaign.claimed || 0}/{campaign.totalSupply || 0}
{campaign.totalSupply ? ((campaign.claimed || 0) / campaign.totalSupply) * 100 : 0}%
{(campaign.distributionMethod || campaign.distribution || 'manual').replace('_', ' ')}
Status: {campaign.status || 'draft'}
```

### 3. Action Buttons (Lines 235-246)
**Before:**
```javascript
{campaign.distribution === 'qr_code' && ...}
{campaign.distribution === 'redeem_code' && ...}
```

**After:**
```javascript
{(campaign.distributionMethod === 'qr_code' || campaign.distribution === 'qr_code') && ...}
{(campaign.distributionMethod === 'redeem_code' || campaign.distribution === 'redeem_code') && ...}
```

## Database vs UI Field Mapping

| Database Field | UI/Mock Field | Fallback |
|---|---|---|
| `campaignName` | `name` | `''` |
| `campaignType` | `type` | `'reward'` |
| `distributionMethod` | `distribution` | `'manual'` |
| `minted` | `minted` | `0` |
| `claimed` | `claimed` | `0` |
| `redeemed` | `redeemed` | `0` |
| `totalSupply` | `totalSupply` | `0` |
| `status` | `status` | `'draft'` |

## Safe Access Pattern
All field accesses now use:
```javascript
campaign.field || fallbackValue
```

This prevents:
- TypeError when field is undefined
- Division by zero errors
- toLowerCase() on undefined

## Testing
✅ Create campaign → Displays correctly
✅ Search campaigns → No errors
✅ Empty state → Shows properly
✅ Field defaults → Shows 0 or empty string
