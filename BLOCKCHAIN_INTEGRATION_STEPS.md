# Blockchain Integration Steps

## Prerequisites Completed ✅
- [x] Campaign model with phygital support
- [x] Smart contract with pre-minting and transfer functions
- [x] Backend routes for campaigns, claims, and redemption
- [x] Frontend campaign creation and display
- [x] Field mapping fixed

---

## Step 1: Deploy Updated Smart Contract

### 1.1 Compile Contract
```bash
cd contracts
npx hardhat compile
```

### 1.2 Deploy to U2U Testnet
```bash
npx hardhat run scripts/deploy.js --network u2u-testnet
```

### 1.3 Update Environment Variables
Copy the deployed contract address to:
- `server/.env` → `NFT_CONTRACT_ADDRESS=0x...`
- `src/config/blockchain.js` → Update contract address

---

## Step 2: Create Escrow Wallet for Brand

Brands need a wallet to hold pre-minted NFTs.

### Option A: Generate New Wallet
```javascript
// server/scripts/createEscrowWallet.js
import { ethers } from 'ethers';

const wallet = ethers.Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('⚠️ SAVE THIS SECURELY!');
```

Run:
```bash
node server/scripts/createEscrowWallet.js
```

### Option B: Use Brand's Existing Wallet
Brand provides their wallet address (no private key needed on backend).

### Add to Brand Model
```javascript
// server/models/Brand.js
escrowWallet: {
  type: String,
  default: null
}
```

---

## Step 3: Add Campaign Approval UI (Admin Dashboard)

### 3.1 Create Admin Route
```javascript
// server/routes/admin.js
router.get('/campaigns/pending', verifyToken, isAdmin, async (req, res) => {
  const campaigns = await Campaign.find({ status: 'pending_approval' });
  res.json(campaigns);
});
```

### 3.2 Create Admin Component
```jsx
// src/components/admin/CampaignApproval.jsx
const PendingCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);

  const handleApprove = async (campaignId) => {
    await api.post(`/campaigns/${campaignId}/approve`);
    fetchCampaigns();
  };

  const handleReject = async (campaignId, reason) => {
    await api.post(`/campaigns/${campaignId}/reject`, { reason });
    fetchCampaigns();
  };

  return (
    <div>
      {campaigns.map(campaign => (
        <CampaignCard
          campaign={campaign}
          onApprove={() => handleApprove(campaign._id)}
          onReject={(reason) => handleReject(campaign._id, reason)}
        />
      ))}
    </div>
  );
};
```

---

## Step 4: Add Pre-Minting UI (Brand Dashboard)

### 4.1 Update CampaignManager Actions

Add pre-mint button for approved phygital campaigns:

```jsx
// src/components/brand/CampaignManager.jsx

const handlePreMint = async (campaign) => {
  try {
    setLoading(true);

    // Get brand's escrow wallet
    const brandResponse = await api.get(`/brands/${user.uid}`);
    const escrowWallet = brandResponse.data.escrowWallet;

    if (!escrowWallet) {
      alert('Please set up your escrow wallet in Settings first');
      return;
    }

    // Pre-mint NFTs
    const response = await api.post(`/campaigns/${campaign._id}/pre-mint`, {
      escrowWallet
    });

    alert(`Successfully pre-minted ${response.data.tokenIds.length} NFTs!`);
    fetchCampaigns(); // Refresh
  } catch (error) {
    alert('Error pre-minting: ' + error.response?.data?.message);
  } finally {
    setLoading(false);
  }
};

// In render:
{campaign.status === 'approved' && !campaign.blockchain?.preMinted && (
  <button
    onClick={() => handlePreMint(campaign)}
    className="bg-purple-600 text-white px-4 py-2 rounded-lg"
  >
    🔨 Pre-Mint NFTs
  </button>
)}

{campaign.blockchain?.preMinted && (
  <div className="text-green-600 font-medium">
    ✅ {campaign.blockchain.tokenIds.length} NFTs Pre-Minted
  </div>
)}
```

### 4.2 Add Activate Campaign Button

```jsx
const handleActivate = async (campaignId) => {
  try {
    await api.patch(`/campaigns/${campaignId}/status`, { status: 'active' });
    fetchCampaigns();
  } catch (error) {
    alert('Error activating campaign: ' + error.message);
  }
};

// In render:
{campaign.status === 'approved' && campaign.blockchain?.preMinted && (
  <button
    onClick={() => handleActivate(campaign._id)}
    className="bg-green-600 text-white px-4 py-2 rounded-lg"
  >
    🚀 Activate Campaign
  </button>
)}
```

---

## Step 5: Create User Campaign Browse Page

### 5.1 Create ActiveCampaigns Component
```jsx
// src/pages/ActiveCampaigns.jsx
import { useState, useEffect } from 'react';
import api from '../config/api';

const ActiveCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get('/campaigns/active/all');
        setCampaigns(response.data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Active Campaigns</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <CampaignCard key={campaign._id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
};
```

### 5.2 Create CampaignCard Component
```jsx
const CampaignCard = ({ campaign }) => {
  const [claiming, setClaiming] = useState(false);
  const [eligible, setEligible] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) return;
      const response = await api.get(
        `/campaigns/${campaign._id}/check-eligibility/${user.uid}`
      );
      setEligible(response.data.eligible);
    };
    checkEligibility();
  }, [campaign, user]);

  const handleClaim = async () => {
    try {
      setClaiming(true);
      const response = await api.post(`/campaign-claims/${campaign._id}/claim`);
      alert(`NFT Claimed! Transaction: ${response.data.transactionHash}`);
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="border rounded-lg p-6">
      <img src={campaign.nftImage} className="w-full h-48 object-cover rounded mb-4" />
      <h3 className="text-xl font-bold">{campaign.campaignName}</h3>
      <p className="text-gray-600 mt-2">{campaign.description}</p>

      <div className="mt-4">
        <div className="text-sm text-gray-500">
          {campaign.claimed}/{campaign.totalSupply} Claimed
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${(campaign.claimed / campaign.totalSupply) * 100}%` }}
          />
        </div>
      </div>

      {campaign.isPhygital && (
        <div className="mt-4 p-3 bg-purple-50 rounded">
          <div className="text-sm font-medium text-purple-800">🎁 Phygital NFT</div>
          <div className="text-xs text-purple-600 mt-1">
            Redeemable for: {campaign.physicalItem.name}
          </div>
        </div>
      )}

      <button
        onClick={handleClaim}
        disabled={!eligible || claiming}
        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {claiming ? 'Claiming...' : 'Claim NFT'}
      </button>

      {!eligible && eligible !== null && (
        <div className="text-sm text-red-600 mt-2">
          {eligible === false ? 'Already claimed or not eligible' : ''}
        </div>
      )}
    </div>
  );
};
```

---

## Step 6: Add Physical Redemption UI

### 6.1 Create RedemptionRequest Component
```jsx
// src/components/nft/RedemptionRequest.jsx
const RedemptionRequest = ({ claim, onSuccess }) => {
  const [address, setAddress] = useState({
    fullName: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/physical-redemption/claims/${claim._id}/request-redemption`, {
        shippingAddress: address
      });
      alert('Redemption requested! Brand will process your order.');
      onSuccess();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        placeholder="Full Name"
        value={address.fullName}
        onChange={(e) => setAddress({...address, fullName: e.target.value})}
        required
      />
      <input
        placeholder="Address"
        value={address.addressLine1}
        onChange={(e) => setAddress({...address, addressLine1: e.target.value})}
        required
      />
      {/* More fields... */}

      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
        Request Physical Item
      </button>
    </form>
  );
};
```

### 6.2 Add to NFT Display
```jsx
// In NFTCollection or similar component
{nft.campaignId && nft.campaignId.isPhygital && !nft.redeemed && (
  <RedemptionRequest claim={claim} onSuccess={refreshNFTs} />
)}
```

---

## Step 7: Add Brand Fulfillment Dashboard

### 7.1 Create RedemptionManager Component
```jsx
// src/components/brand/RedemptionManager.jsx
const RedemptionManager = ({ campaignId }) => {
  const [redemptions, setRedemptions] = useState([]);

  useEffect(() => {
    const fetchRedemptions = async () => {
      const response = await api.get(`/physical-redemption/campaign/${campaignId}/redemptions`);
      setRedemptions(response.data);
    };
    fetchRedemptions();
  }, [campaignId]);

  const updateStatus = async (claimId, status, trackingNumber) => {
    await api.patch(`/physical-redemption/claims/${claimId}/redemption-status`, {
      status,
      trackingNumber
    });
    fetchRedemptions();
  };

  return (
    <div>
      <h2>Fulfillment Queue</h2>
      {redemptions.map(claim => (
        <RedemptionCard
          key={claim._id}
          claim={claim}
          onUpdateStatus={updateStatus}
        />
      ))}
    </div>
  );
};
```

---

## Step 8: Add Route to App

```jsx
// src/App.jsx
import ActiveCampaigns from './pages/ActiveCampaigns';

<Route path="/campaigns" element={<ActiveCampaigns />} />
```

---

## Testing Checklist

### Campaign Creation & Approval
- [ ] Brand creates phygital campaign
- [ ] Campaign saves to database with `status: 'draft'`
- [ ] Brand clicks "Submit for Approval"
- [ ] Status changes to `pending_approval`
- [ ] Admin sees campaign in pending list
- [ ] Admin approves campaign
- [ ] Status changes to `approved`

### Pre-Minting
- [ ] Brand has escrow wallet configured
- [ ] Brand clicks "Pre-Mint NFTs"
- [ ] Backend calls `blockchainService.batchMintToEscrow()`
- [ ] Smart contract mints NFTs to escrow wallet
- [ ] `campaign.blockchain.tokenIds` populated
- [ ] `campaign.blockchain.preMinted` set to true
- [ ] `campaign.minted` equals `totalSupply`

### Campaign Activation
- [ ] Brand clicks "Activate Campaign"
- [ ] Status changes to `active`
- [ ] Campaign appears in `/campaigns/active/all`

### User Claiming
- [ ] User sees active campaign
- [ ] User clicks "Claim NFT"
- [ ] Backend checks eligibility
- [ ] Backend gets next available tokenId
- [ ] Backend calls `blockchainService.transferFromEscrow()`
- [ ] NFT transferred to user's wallet
- [ ] CampaignClaim created
- [ ] `campaign.claimed` incremented
- [ ] NFT visible in user's collection

### Physical Redemption
- [ ] User requests physical redemption
- [ ] Shipping address saved
- [ ] Brand sees redemption request
- [ ] Brand updates status to "processing"
- [ ] Brand updates status to "shipped" with tracking
- [ ] Brand updates status to "delivered"
- [ ] NFT marked as `redeemed: true`

---

## Environment Variables Needed

### Server (.env)
```
NFT_CONTRACT_ADDRESS=0x...
U2U_RPC_URL=https://rpc-nebulas-testnet.uniultra.xyz
PRIVATE_KEY=0x... (Platform wallet for executing transactions)
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_NFT_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=2484 (U2U Testnet)
```

---

## Next Steps Priority

1. **Deploy Contract** - Get blockchain running
2. **Add Escrow Wallet Management** - Brand settings
3. **Build Admin Approval UI** - Campaign review
4. **Add Pre-Mint Button** - Brand dashboard
5. **Create User Campaigns Page** - Browse & claim
6. **Add Redemption UI** - Physical item requests
7. **Build Fulfillment Dashboard** - Brand order management

Ready to start? Which step would you like to implement first?
