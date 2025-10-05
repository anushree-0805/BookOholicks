# Module 4 – Rewards & NFTs Implementation Guide

## Overview
Module 4 implements a comprehensive NFT rewards system integrated with U2U blockchain testnet. Users earn NFTs for various achievements including reading streaks, post engagement, community participation, and event attendance.

## Features Implemented

### 1. Reward System
- **Automated reward tracking** for various user activities
- **NFT minting** triggered by achievements
- **Multiple reward types**:
  - 7-day posting streak → Active Poster NFT
  - 100 likes on a post → Popular Opinion NFT
  - Joining communities → Explorer NFT
  - Attending events → Event Participant NFT
  - Creating events → Event Organizer NFT
  - Reading streaks → Bronze/Silver/Gold/Platinum Reading Badges

### 2. Blockchain Integration
- **Smart contract** deployed on U2U testnet
- **ERC-721 compliant** NFT implementation
- **On-chain metadata** storage
- **Wallet connection** via MetaMask
- **Automatic minting** to user wallets

### 3. User Interface
- **NFT Collection Gallery** ("My Shelf")
- **Wallet connection component**
- **Blockchain verification** indicators
- **Transaction history** links
- **Redemption tracking**

## File Structure

### Backend
```
server/
├── models/
│   ├── Reward.js           # Reward tracking model
│   └── NFT.js             # NFT database model (updated)
├── routes/
│   ├── rewards.js         # Reward API endpoints
│   └── blockchain.js      # Blockchain interaction endpoints
└── services/
    ├── rewardService.js   # Reward logic and NFT minting
    └── blockchainService.js # U2U blockchain integration
```

### Frontend
```
src/
└── components/
    └── dashboard/
        ├── WalletConnect.jsx    # Wallet connection UI
        └── NFTCollection.jsx    # NFT gallery (updated)
```

### Smart Contracts
```
contracts/
├── BookoholicsNFT.sol    # Main NFT contract
└── README.md            # Contract deployment guide
```

## Setup Instructions

### 1. Backend Configuration

Add to `server/.env`:
```env
# U2U Testnet Configuration
U2U_RPC_URL=https://rpc-nebulas-testnet.uniultra.xyz
U2U_CHAIN_ID=2484
NFT_CONTRACT_ADDRESS=<your_deployed_contract_address>
PRIVATE_KEY=<your_wallet_private_key>
```

### 2. Install Dependencies

```bash
cd server
npm install ethers@6
```

### 3. Deploy Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create new file `BookoholicsNFT.sol`
3. Copy contract code from `contracts/BookoholicsNFT.sol`
4. Install OpenZeppelin contracts in Remix
5. Compile with Solidity 0.8.20+
6. Configure MetaMask for U2U testnet:
   - Network: U2U Testnet
   - RPC: https://rpc-nebulas-testnet.uniultra.xyz
   - Chain ID: 2484
7. Deploy contract and save address
8. Update `NFT_CONTRACT_ADDRESS` in `.env`

### 4. Frontend Configuration

Add to `vite.config.js` if needed:
```javascript
define: {
  'process.env.NFT_CONTRACT_ADDRESS': JSON.stringify(process.env.NFT_CONTRACT_ADDRESS)
}
```

## API Endpoints

### Rewards API (`/api/rewards`)

#### Initialize User Rewards
```http
POST /api/rewards/initialize
Authorization: Bearer <firebase_token>
```

#### Get Reward Progress
```http
GET /api/rewards/:userId
Authorization: Bearer <firebase_token>
```

#### Check Reading Streak
```http
POST /api/rewards/check-reading-streak
Authorization: Bearer <firebase_token>
Content-Type: application/json

{
  "streakDays": 7
}
```

### Blockchain API (`/api/blockchain`)

#### Connect Wallet
```http
POST /api/blockchain/connect-wallet
Authorization: Bearer <firebase_token>
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

#### Get User NFTs
```http
GET /api/blockchain/nfts/:userId
Authorization: Bearer <firebase_token>
```

#### Redeem NFT
```http
POST /api/blockchain/nfts/:tokenId/redeem
Authorization: Bearer <firebase_token>
```

#### Get Contract Stats
```http
GET /api/blockchain/stats
Authorization: Bearer <firebase_token>
```

## Reward Triggers

### Automatic Triggers

1. **Posting Streak** (posts.js:86)
   - Triggered on post creation
   - Checks last 7 days of posting activity
   - Awards "Active Poster NFT" for 7 consecutive days

2. **Post Likes** (posts.js:128)
   - Triggered when post receives a like
   - Checks if post has ≥100 likes
   - Awards "Popular Opinion NFT"

3. **Community Join** (communities.js:133)
   - Triggered when user joins a community
   - Awards "Explorer NFT" for first community

4. **Event Creation** (events.js:65)
   - Triggered when user creates an event
   - Awards "Event Organizer NFT"

5. **Event Attendance** (events.js:115)
   - Triggered when user RSVPs to an event
   - Awards "Event Participant NFT"

6. **Reading Streak** (streaks.js:82)
   - Triggered on daily reading log
   - Awards streak badges at 7, 30, 90, 365 days

## NFT Metadata Structure

```javascript
{
  name: "Bronze Reading Badge",
  description: "Earned by maintaining a 7-day reading streak",
  category: "streak",
  rarity: "Common",
  rewardType: "streak_bronze",
  brand: "Bookoholics",
  benefits: [
    "Bronze streak badge",
    "5% discount on next book purchase",
    "Streak protection (1 day)"
  ],
  // Blockchain data
  tokenId: "1",
  transactionHash: "0x...",
  blockNumber: 12345,
  onChain: true,
  redeemed: false
}
```

## Testing the System

### 1. Initialize User Rewards
```bash
curl -X POST http://localhost:5000/api/rewards/initialize \
  -H "Authorization: Bearer <token>"
```

### 2. Test Posting Streak
```bash
# Create posts on consecutive days
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Daily post", "isPublic": true}'
```

### 3. Test Reading Streak
```bash
curl -X POST http://localhost:5000/api/streaks/log-session \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "bookTitle": "The Great Gatsby",
    "minutesRead": 30,
    "pagesRead": 20
  }'
```

### 4. Connect Wallet and View NFTs
1. Navigate to Dashboard → NFT Collection
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Switch to U2U testnet when prompted
5. View minted NFTs in collection

## Smart Contract Functions

### For Users
- `redeemNFT(tokenId)` - Redeem NFT benefits
- `getTokensByOwner(address)` - View owned NFTs
- `getMetadata(tokenId)` - Get NFT details

### For Admin (Contract Owner)
- `mintNFT(...)` - Mint new NFT
- `batchMintNFT(...)` - Batch mint NFTs

## Utility Functions

### Check if User Has Wallet
```javascript
const user = await User.findOne({ userId });
if (user?.walletAddress) {
  // User has connected wallet
}
```

### Mint NFT on Achievement
```javascript
import { checkReadingStreak } from '../services/rewardService.js';

// This automatically mints NFT if user has wallet
await checkReadingStreak(userId, streakDays);
```

## Frontend Components

### WalletConnect Component
- Displays wallet connection status
- Handles MetaMask integration
- Auto-adds U2U testnet to MetaMask
- Mints existing off-chain NFTs on connect

### NFTCollection Component
- Displays user's NFT collection
- Shows blockchain status indicators
- Links to blockchain explorer
- Handles NFT redemption

## Troubleshooting

### Contract Not Deploying
- Ensure MetaMask has U2U testnet configured
- Get testnet tokens from faucet
- Check Solidity version (0.8.20+)

### NFTs Not Minting
- Verify contract address in `.env`
- Check wallet has sufficient U2U tokens
- Ensure user has connected wallet
- Check server logs for errors

### Wallet Not Connecting
- Install MetaMask extension
- Ensure site is HTTPS or localhost
- Clear browser cache
- Check console for errors

## Future Enhancements

1. **IPFS Integration** - Store NFT images on IPFS
2. **Marketplace** - Allow NFT trading
3. **Staking** - Stake NFTs for benefits
4. **Governance** - Use NFTs for voting rights
5. **Brand Partnerships** - Custom branded NFTs
6. **Real-world Benefits** - Discount codes, signed books

## Security Considerations

- Private keys stored securely in `.env`
- Never commit `.env` to version control
- Use hardware wallet for production
- Audit smart contract before mainnet
- Rate limit minting endpoints
- Validate user ownership before actions

## Support & Resources

- U2U Testnet Explorer: https://testnet.u2uscan.xyz
- U2U Docs: https://docs.uniultra.xyz
- OpenZeppelin: https://docs.openzeppelin.com
- Remix IDE: https://remix.ethereum.org

## Conclusion

Module 4 successfully integrates blockchain-based NFT rewards into the Bookoholics platform. Users can earn, collect, and redeem NFTs for their reading achievements, with all rewards verifiable on the U2U blockchain.
