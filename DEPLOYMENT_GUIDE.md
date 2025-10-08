# BookoholicsNFT Deployment Guide - U2U Mainnet

## Quick Deployment Using Remix (Recommended)

### Step 1: Prepare Your MetaMask
1. Add U2U Mainnet to MetaMask:
   - Network Name: **U2U Solaris Mainnet**
   - RPC URL: **https://rpc-mainnet.uniultra.xyz**
   - Chain ID: **39**
   - Currency Symbol: **U2U**
   - Block Explorer: **https://u2uscan.xyz**

2. Ensure you have **at least 2-3 U2U tokens** in your wallet for gas fees

### Step 2: Deploy with Remix
1. Go to https://remix.ethereum.org

2. Create a new file: `BookoholicsNFT.sol`

3. Copy and paste the contract from: `D:\bookOholicks\contracts\BookoholicsNFT.sol`

4. **Compile Settings** (IMPORTANT):
   - Compiler: `0.8.20`
   - Click "Advanced Configurations"
   - Enable "Optimize": checked
   - Runs: `200`
   - Add to "Compiler Configuration" textarea:
   ```json
   {
     "optimizer": {
       "enabled": true,
       "runs": 200
     },
     "viaIR": true
   }
   ```

5. Click **"Compile BookoholicsNFT.sol"**

6. Go to **"Deploy & Run Transactions"** tab
   - Environment: Select **"Injected Provider - MetaMask"**
   - Confirm MetaMask shows: **"U2U Solaris Mainnet"**
   - Contract: Select **"BookoholicsNFT"**
   - Click **"Deploy"**

7. In MetaMask popup:
   - Set Gas Limit: **6000000** (6M)
   - Confirm transaction

8. Wait for deployment (30-60 seconds)

9. **SAVE THE CONTRACT ADDRESS!** You'll see it under "Deployed Contracts"

### Step 3: Verify on U2U Explorer
Visit: `https://u2uscan.xyz/address/YOUR_CONTRACT_ADDRESS`

### Step 4: Update Your Backend
Replace the contract address in `D:\bookOholicks\server\.env`:
```
NFT_CONTRACT_ADDRESS=0x_YOUR_NEW_CONTRACT_ADDRESS
```

Restart your server.

---

## Alternative: Hardhat Deployment (Advanced)

If Remix doesn't work, install dependencies and try Hardhat:

```bash
cd D:\bookOholicks
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv --legacy-peer-deps
```

1. Add your private key to `hardhat.config.js`:
```javascript
accounts: ["YOUR_PRIVATE_KEY_HERE"]
```

2. Compile:
```bash
npx hardhat compile
```

3. Deploy:
```bash
npx hardhat run scripts/deploy.cjs --network u2uMainnet
```

---

## Troubleshooting

### Gas Estimation Failed
- Increase gas limit manually in MetaMask to 8000000 (8M)
- Ensure you have enough U2U tokens

### Stack Too Deep Error
- Make sure `viaIR: true` is enabled in compiler settings
- Use the `BookoholicsNFT.sol` file (optimized version)

### Module Not Found (Hardhat)
- Run: `npm install --legacy-peer-deps`
- Or use Remix instead

---

## Contract Functions Overview

After deployment, you can interact with these functions:

### For Achievement NFTs:
- `mintNFT()` - Mint reward NFTs to users
- `redeemNFT()` - Users redeem their NFT benefits

### For Campaign NFTs:
- `mintToEscrow()` - Pre-mint NFTs to brand's wallet
- `batchMintToEscrow()` - Batch pre-mint (up to 50)
- `transferFromEscrow()` - Transfer NFT to user when they claim
- `batchTransferFromEscrow()` - Batch transfer

### Query Functions:
- `getTokensByOwner()` - Get all NFTs owned by an address
- `getMetadata()` - Get NFT metadata
- `getBenefits()` - Get NFT benefits
- `getUnredeemedTokens()` - Get unredeemed NFTs
- `hasReward()` - Check if user has specific reward
- `totalSupply()` - Total NFTs minted

---

## Contract Address
After deployment, your contract will be at:
- Network: U2U Solaris Mainnet
- Chain ID: 39
- Address: (Save from deployment)
- Explorer: https://u2uscan.xyz

**IMPORTANT:** Save the contract address and update your `.env` file!
