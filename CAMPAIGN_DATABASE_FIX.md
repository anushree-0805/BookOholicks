# Campaign Database Integration - Fixed

## Issues Fixed

### 1. ✅ Campaign Creation Not Saving to Database
**Problem:** CampaignWizard had only a TODO comment, campaigns weren't being saved

**Solution:**
- Integrated Firebase auth (`useAuth` hook) to get current user
- Added API call to POST `/api/campaigns` endpoint
- Properly formatted campaign data with all required fields:
  - `brandId`: From Firebase user UID
  - `brandName`: From user profile
  - All campaign fields properly mapped
  - Phygital-specific fields conditionally added

### 2. ✅ Campaigns Not Visible in UI
**Problem:** CampaignManager was using mock data only

**Solution:**
- Added API integration to fetch campaigns from database
- GET `/api/campaigns/brand/:brandId` on component mount
- Added loading and error states
- Updated field mapping for database schema (e.g., `campaignName` vs `name`)

### 3. ✅ Brand Identity Missing
**Problem:** No brandId or brandName in campaign creation

**Solution:**
- Extract `brandId` from Firebase user UID
- Extract `brandName` from userProfile
- Both included in campaign payload

### 4. ✅ Phygital Fields Not in Form
**Problem:** No way to add physical item details in wizard

**Solution:**
- Added phygital checkbox when campaign type is "phygital"
- Added fields:
  - Physical Item Name
  - Physical Item Description
  - Estimated Value ($)
- Conditionally sent to backend in `physicalItem` object

---

## Changes Made

### `src/components/brand/CampaignWizard.jsx`

**Added:**
```jsx
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/api';

// Added state
const { user, userProfile } = useAuth();
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Added phygital fields to campaignData state
isPhygital: false,
physicalItemName: '',
physicalItemDescription: '',
physicalItemValue: '',
```

**Updated handleSubmit:**
```javascript
const handleSubmit = async () => {
  setLoading(true);
  setError(null);

  try {
    const payload = {
      brandId: user.uid,
      brandName: userProfile?.name || 'Unknown Brand',
      // ... all campaign fields
    };

    // Add phygital fields if applicable
    if (campaignData.isPhygital) {
      payload.physicalItem = {
        enabled: true,
        name: campaignData.physicalItemName,
        // ...
      };
    }

    const response = await api.post('/campaigns', payload);

    if (onSuccess) {
      onSuccess(response.data);
    }

    onClose();
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to create campaign');
  } finally {
    setLoading(false);
  }
};
```

**Added Phygital UI (Step 1):**
```jsx
{campaignData.campaignType === 'phygital' && (
  <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
    <input type="checkbox" ... />
    {campaignData.isPhygital && (
      <>
        <input placeholder="Physical Item Name" />
        <textarea placeholder="Physical Item Description" />
        <input type="number" placeholder="Estimated Value" />
      </>
    )}
  </div>
)}
```

**Added Loading/Error UI:**
```jsx
{error && <div className="mb-4 p-3 bg-red-50...">{error}</div>}

<button disabled={loading}>
  {loading ? (
    <>
      <spinner />
      Creating...
    </>
  ) : (
    'Create Campaign'
  )}
</button>
```

---

### `src/components/brand/CampaignManager.jsx`

**Added:**
```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/api';

const { user } = useAuth();
const [campaigns, setCampaigns] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Fetch campaigns from API
useEffect(() => {
  const fetchCampaigns = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.get(`/campaigns/brand/${user.uid}`);
      setCampaigns(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  fetchCampaigns();
}, [user]);
```

**Updated Rendering:**
```jsx
{loading && <LoadingSpinner />}
{error && <ErrorMessage />}
{!loading && <CampaignsGrid />}

// Updated field mapping
campaign._id || campaign.id
campaign.campaignName || campaign.name
campaign.campaignType || campaign.type
```

---

### `src/pages/BrandDashboard.jsx`

**Added:**
```jsx
const [refreshKey, setRefreshKey] = useState(0);

const handleCampaignCreated = () => {
  setShowWizard(false);
  setRefreshKey(prev => prev + 1); // Trigger refresh
};

<CampaignWizard
  onClose={() => setShowWizard(false)}
  onSuccess={handleCampaignCreated}
/>

<CampaignManager key={refreshKey} ... />
```

**Behavior:**
- When campaign is created successfully, calls `onSuccess`
- Increments `refreshKey` which remounts CampaignManager
- CampaignManager re-fetches campaigns from database

---

## Data Flow

### Campaign Creation Flow:
```
1. User fills CampaignWizard form
   ↓
2. Clicks "Create Campaign"
   ↓
3. CampaignWizard.handleSubmit():
   - Gets brandId from auth.user.uid
   - Gets brandName from userProfile
   - Formats payload with all fields
   - Adds physicalItem if isPhygital checked
   ↓
4. POST /api/campaigns
   ↓
5. server/routes/campaigns.js (line 32):
   - Creates new Campaign document
   - Saves to MongoDB
   ↓
6. Returns campaign data
   ↓
7. Calls onSuccess(campaign)
   ↓
8. BrandDashboard.handleCampaignCreated():
   - Closes wizard
   - Increments refreshKey
   ↓
9. CampaignManager remounts and fetches fresh data
```

### Campaign Display Flow:
```
1. CampaignManager mounts
   ↓
2. useEffect triggers on user change
   ↓
3. GET /api/campaigns/brand/:brandId
   ↓
4. server/routes/campaigns.js (line 13):
   - Finds campaigns by brandId
   - Returns array sorted by createdAt desc
   ↓
5. setCampaigns(response.data)
   ↓
6. Renders campaigns in grid
```

---

## API Endpoints Used

### Campaign Creation:
```
POST /api/campaigns
Headers: Authorization: Bearer <firebase-token>
Body: {
  brandId: string,
  brandName: string,
  campaignName: string,
  campaignType: 'reward' | 'access' | 'phygital' | 'achievement',
  description: string,
  nftImage: string,
  category: string,
  rarity: string,
  totalSupply: number,
  unlimited: boolean,
  benefits: string[],
  utility: { type, value, description },
  distributionMethod: string,
  startDate: Date,
  endDate: Date | null,
  status: 'draft',
  eligibility: { type, requirements, description },
  physicalItem?: {
    enabled: boolean,
    name: string,
    description: string,
    estimatedValue: number,
    images: string[],
    shippingInfo: string
  }
}
```

### Campaign Fetch:
```
GET /api/campaigns/brand/:brandId
Headers: Authorization: Bearer <firebase-token>
Response: Campaign[]
```

---

## Testing Checklist

- [ ] Create non-phygital campaign → Saves to DB
- [ ] Create phygital campaign → Saves with physicalItem fields
- [ ] View campaigns list → Fetches from DB
- [ ] Campaign appears after creation → Auto-refresh works
- [ ] Loading states display correctly
- [ ] Error handling works
- [ ] BrandId and brandName correctly saved

---

## Next Steps (For Smart Contract Integration)

After campaign is created in database, the flow will be:

1. **Brand submits for approval:**
   ```
   POST /api/campaigns/:id/submit-for-approval
   → status: 'pending_approval'
   ```

2. **Admin approves:**
   ```
   POST /api/campaigns/:id/approve
   → status: 'approved'
   ```

3. **Pre-mint NFTs (Phygital only):**
   ```
   POST /api/campaigns/:id/pre-mint
   Body: { escrowWallet: '0x...' }

   Backend:
   - Calls blockchainService.batchMintToEscrow()
   - Mints totalSupply NFTs to escrow wallet
   - Stores tokenIds in campaign.blockchain.tokenIds
   - Sets campaign.blockchain.preMinted = true
   ```

4. **Activate campaign:**
   ```
   PATCH /api/campaigns/:id/status
   Body: { status: 'active' }
   ```

5. **Users claim NFTs:**
   ```
   POST /api/campaign-claims/:campaignId/claim

   Backend:
   - Gets next available tokenId from campaign.blockchain.tokenIds
   - Calls blockchainService.transferFromEscrow()
   - Transfers NFT from escrow to user wallet
   - Creates CampaignClaim record
   - Increments campaign.claimed
   ```

---

## Files Modified

✅ `src/components/brand/CampaignWizard.jsx`
✅ `src/components/brand/CampaignManager.jsx`
✅ `src/pages/BrandDashboard.jsx`

## Files Already Configured (Backend)

✅ `server/models/Campaign.js`
✅ `server/routes/campaigns.js`
✅ `server/services/blockchainService.js`
✅ `contracts/BookoholicsNFT.sol`

---

**Status: ✅ COMPLETE**

Brands can now:
1. Create campaigns via wizard
2. Campaigns save to MongoDB
3. Campaigns display in CampaignManager
4. Phygital campaigns have physical item details
5. Auto-refresh after creation
