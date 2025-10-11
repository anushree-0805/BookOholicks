# Smart Contract Testing Guide

## Overview
This guide explains where and how to test your Bookoholics NFT smart contract on the U2U blockchain.

## Current Deployment
- **Contract Address**: `0xdd5db1b48516a0319597ab10328400db861a6f8e`
- **Network**: U2U Nebulas Testnet
- **Chain ID**: 2484
- **RPC URL**: https://rpc-nebulas-testnet.uniultra.xyz

## Testing Environments

### 1. U2U Testnet Block Explorer (Primary Testing Tool)

**URL**: https://testnet.u2uscan.xyz

**What You Can Do**:
- View transaction status and confirmations
- Check token IDs minted in event logs
- Verify gas usage and costs
- Monitor contract interactions
- View wallet balances

**Example**: Your recent transaction
https://testnet.u2uscan.xyz/tx/0x61ceef07a4669e8178a7a5688bc88008b7b0c0da6838ebce0f6bfcdc7d1842e0

**How to Verify Pre-Mint**:
1. Open the transaction link in the block explorer
2. Check the "Logs" or "Events" tab
3. Look for `NFTMinted` events
4. Extract token IDs from each event
5. Count how many tokens were minted successfully

### 2. Local Hardhat Network (Fast Development Testing)

**Setup**:
```bash
# Start local Hardhat node
npx hardhat node

# In another terminal, deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Run tests
npx hardhat test
```

**Benefits**:
- Instant confirmations (no waiting)
- Free (no gas costs)
- Full control over blockchain state
- Easy debugging with console.log

**When to Use**:
- During development and debugging
- Before deploying to testnet
- When testing contract logic

### 3. U2U Testnet (Real Network Testing)

**Setup**:
```bash
# Deploy to testnet
npx hardhat run scripts/deploy.js --network u2uTestnet

# Verify contract (if supported)
npx hardhat verify --network u2uTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

**Get Testnet Tokens**:
- Check U2U documentation for testnet faucet
- Or ask in U2U Discord/Telegram for testnet tokens

**When to Use**:
- Final testing before mainnet
- Testing with real network conditions
- Verifying gas costs
- Testing transaction confirmation times

## Testing Your Recent Transaction

Your transaction appears to have timed out, but might actually be confirmed. Here's how to check:

### Step 1: Check Block Explorer
Visit: https://testnet.u2uscan.xyz/tx/0x61ceef07a4669e8178a7a5688bc88008b7b0c0da6838ebce0f6bfcdc7d1842e0

Look for:
- Status: Success / Pending / Failed
- Block number (if confirmed)
- NFTMinted events in the logs

### Step 2: Extract Token IDs (If Confirmed)
If the transaction shows as "Success":
1. Go to the "Logs" tab
2. Find all `NFTMinted` events
3. Each event contains a `tokenId` parameter
4. Collect all token IDs (should be 100 for your batch mint)

### Step 3: Manually Verify in Backend
If confirmed, use the API endpoint to mark it as complete:

```bash
curl -X POST http://localhost:5000/api/campaigns/{campaignId}/verify-pre-mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "tokenIds": ["1", "2", "3", ... "100"]
  }'
```

## Common Issues & Solutions

### Issue 1: Transaction Timeout (Your Current Issue)
**Problem**: Transaction times out waiting for confirmation
**Solution**:
- Check block explorer to see if it actually confirmed
- Use the `/verify-pre-mint` endpoint to manually mark as complete
- **Fixed**: Timeout increased from 10 to 20 minutes
- **Fixed**: Added automatic retry after timeout

### Issue 2: Gas Estimation Failed
**Problem**: `estimateGas` fails before sending transaction
**Solution**:
- Check wallet has sufficient balance
- Verify contract function parameters are correct
- Try with a lower quantity if batch minting

### Issue 3: Transaction Reverted
**Problem**: Transaction fails on-chain
**Solution**:
- Check contract has proper permissions
- Verify escrow wallet address is valid
- Ensure contract has correct state

## API Endpoints for Testing

### Check Pre-Mint Status
```bash
GET /api/campaigns/{campaignId}/pre-mint-status
```
Returns:
- `status`: idle | pending | processing | completed | failed
- `transactionHash`: Transaction hash if available
- `tokenCount`: Number of tokens minted
- `error`: Error message if failed

### Manually Verify Pre-Mint
```bash
POST /api/campaigns/{campaignId}/verify-pre-mint
Body: {
  "tokenIds": ["1", "2", "3", ...]
}
```
Use this when:
- Transaction confirmed but backend timed out
- You manually verified on block explorer
- Need to recover from timeout state

## Recommended Testing Workflow

1. **Local Development**
   - Write and test contract on Hardhat local network
   - Fix any bugs quickly with instant feedback

2. **Testnet Deployment**
   - Deploy to U2U testnet
   - Test with realistic network conditions
   - Use block explorer to verify all transactions

3. **Backend Integration Testing**
   - Test API endpoints with testnet contract
   - Verify timeout handling works correctly
   - Test manual verification workflow

4. **Mainnet Deployment**
   - Only after thorough testnet testing
   - Start with small batch sizes
   - Monitor first few transactions closely

## Monitoring Tools

### Real-Time Logs
```bash
# Backend logs
cd server && npm start

# Watch for:
# - Transaction submission logs
# - Timeout warnings
# - Confirmation messages
```

### Block Explorer
- Bookmark: https://testnet.u2uscan.xyz
- Add your contract address to watchlist
- Monitor all transactions in real-time

### API Status Check
```bash
# Poll status every 30 seconds during minting
watch -n 30 'curl -s http://localhost:5000/api/campaigns/{campaignId}/pre-mint-status'
```

## Next Steps

1. **Check Your Current Transaction**
   - Visit the block explorer link above
   - Verify if it's confirmed or still pending

2. **If Confirmed**
   - Extract token IDs from logs
   - Use `/verify-pre-mint` to mark as complete

3. **If Still Pending**
   - Wait a bit longer (U2U testnet can be slow)
   - The improved code will now wait up to 20 minutes

4. **If Failed**
   - Check error message in logs
   - Verify wallet balance
   - Try again with the improved timeout handling

## Support Resources

- U2U Documentation: https://docs.uniultra.xyz
- U2U Block Explorer: https://testnet.u2uscan.xyz
- Contract Address: https://testnet.u2uscan.xyz/address/0xdd5db1b48516a0319597ab10328400db861a6f8e

## Recent Improvements

✅ **Timeout increased** from 10 to 20 minutes
✅ **Auto-retry** after timeout to check if actually confirmed
✅ **Better status tracking** (pending vs failed)
✅ **Transaction hash saved** even on timeout for manual verification
✅ **Manual verification endpoint** for recovery
