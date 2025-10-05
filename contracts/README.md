# Bookoholics NFT Smart Contract

## Overview
This directory contains the Solidity smart contract for the Bookoholics NFT rewards system, designed to be deployed on the U2U testnet.

## Contract: BookoholicsNFT.sol

### Features
- **ERC-721 compliant** NFT contract with URI storage
- **On-chain metadata** storage for NFT properties
- **Reward categories**: Streaks, Genre, Rewards, Events, Achievements, Community
- **Rarity levels**: Common, Rare, Epic, Legendary, Mythic
- **Redemption tracking**: Mark NFTs as redeemed when benefits are claimed
- **Batch minting**: Efficient minting of multiple NFTs
- **User reward tracking**: Prevent duplicate rewards

### Deployment Instructions

#### Prerequisites
1. Install MetaMask browser extension
2. Configure U2U testnet in MetaMask:
   - Network Name: U2U Testnet
   - RPC URL: https://rpc-nebulas-testnet.uniultra.xyz
   - Chain ID: 2484
   - Symbol: U2U
   - Block Explorer: https://testnet.u2uscan.xyz

3. Get testnet U2U tokens from the faucet

#### Deploy Using Remix

1. Open [Remix IDE](https://remix.ethereum.org/)

2. Install OpenZeppelin contracts:
   - Go to the "Plugin Manager" tab
   - Activate "Solidity Compiler" and "Deploy & Run Transactions"
   - Use the following import in your contract:
     ```solidity
     import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
     import "@openzeppelin/contracts/access/Ownable.sol";
     import "@openzeppelin/contracts/utils/Counters.sol";
     ```

3. Create a new file `BookoholicsNFT.sol` and paste the contract code

4. Compile:
   - Select compiler version: 0.8.20 or higher
   - Enable optimization (200 runs)
   - Click "Compile BookoholicsNFT.sol"

5. Deploy:
   - In "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask"
   - Ensure MetaMask is connected to U2U testnet
   - Select "BookoholicsNFT" contract
   - Click "Deploy"
   - Confirm transaction in MetaMask

6. Save the deployed contract address for integration

#### Contract Functions

##### Minting Functions
- `mintNFT()` - Mint a single NFT reward
- `batchMintNFT()` - Mint multiple NFTs efficiently

##### Query Functions
- `getTokensByOwner(address)` - Get all NFTs owned by a user
- `getMetadata(uint256)` - Get NFT metadata
- `getBenefits(uint256)` - Get NFT benefits
- `hasReward(RewardType, address)` - Check if user has earned a reward
- `getUnredeemedTokens(address)` - Get unredeemed NFTs for a user
- `totalSupply()` - Get total NFTs minted

##### User Functions
- `redeemNFT(uint256)` - Redeem an NFT's benefits

### NFT Categories
```solidity
enum Category {
    STREAK,       // Reading streak achievements
    GENRE,        // Genre-based achievements
    REWARD,       // General rewards
    EVENT,        // Event participation
    ACHIEVEMENT,  // Misc achievements
    COMMUNITY     // Community engagement
}
```

### Rarity Levels
```solidity
enum Rarity {
    COMMON,      // Common rewards
    RARE,        // Rare achievements
    EPIC,        // Epic milestones
    LEGENDARY,   // Legendary accomplishments
    MYTHIC       // Ultra-rare achievements
}
```

### Reward Types
```solidity
enum RewardType {
    ACTIVE_POSTER,       // 7-day posting streak
    POPULAR_OPINION,     // 100 likes on a post
    EXPLORER,            // Joined first community
    EVENT_PARTICIPANT,   // Attended an event
    EVENT_ORGANIZER,     // Organized an event
    STREAK_BRONZE,       // 7-day reading streak
    STREAK_SILVER,       // 30-day reading streak
    STREAK_GOLD,         // 90-day reading streak
    STREAK_PLATINUM      // 365-day reading streak
}
```

### Integration with Backend

After deployment, update your backend environment variables:

```env
# U2U Testnet Configuration
U2U_RPC_URL=https://rpc-nebulas-testnet.uniultra.xyz
U2U_CHAIN_ID=2484
NFT_CONTRACT_ADDRESS=<your_deployed_contract_address>
PRIVATE_KEY=<your_wallet_private_key>
```

### Security Considerations
- Only the contract owner can mint NFTs
- Users can only redeem their own NFTs
- Duplicate rewards are prevented
- All transfers are tracked and validated

### Gas Optimization
- Batch minting reduces transaction costs
- Efficient storage patterns used
- Counters library for token ID management

### Testing
Before deployment to mainnet:
1. Test all minting scenarios
2. Verify redemption logic
3. Test batch operations
4. Verify metadata retrieval
5. Test transfer functionality

### Contract Address
After deployment, the contract address will be available on U2U testnet explorer:
https://testnet.u2uscan.xyz

### Support
For issues or questions, refer to:
- U2U Documentation: https://docs.uniultra.xyz
- OpenZeppelin Docs: https://docs.openzeppelin.com
