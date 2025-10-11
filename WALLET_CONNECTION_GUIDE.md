# Wallet Connection Guide - Fix for NFT Claim Error

## The Problem

When users try to claim NFTs, they get a **400 Bad Request** error with the message:
```
"Please connect your wallet first"
```

This happens because users don't have a `walletAddress` set in their User profile.

## The Solution

I've added a **Wallet Connection** section to the user profile where they can enter their U2U wallet address.

## How to Set Your Wallet Address

### Step 1: Go to Your Profile/Dashboard
Navigate to your user dashboard where the profile editor is displayed.

### Step 2: Click "Edit Profile"
Click the "Edit Profile" button in the top-right corner.

### Step 3: Scroll to "Wallet Connection" Section
You'll see a new section titled **"Wallet Connection (Required for NFT Claims)"** with a yellow warning box.

### Step 4: Enter Your Wallet Address
In the "Wallet Address (U2U Network)" field, enter your U2U wallet address:
```
Example: 0x1be1A3927fA3C29208891C226e340d2c92D39BBE
```

### Step 5: Save Changes
Click "Save Changes" at the top of the page.

### Step 6: Verify
After saving, you should see:
- ✓ "Connected" status in the Account Information section
- Your wallet address displayed in green with a checkmark

## Testing Your Fix

### Quick Test with Your Existing Wallet
Use one of the wallet addresses from your campaign:
```
Brand Wallet: 0x1be1A3927fA3C29208891C226e340d2c92D39BBE
Escrow Wallet: 0x92f6D96126620d236d467580568d5F310420378C
```

### Complete Flow Test:

1. **Set Wallet Address**
   - Go to profile/dashboard
   - Edit profile
   - Add wallet: `0x1be1A3927fA3C29208891C226e340d2c92D39BBE`
   - Save changes

2. **Try to Claim NFT**
   - Navigate to `/campaigns`
   - Find an active campaign
   - Click "Claim NFT"
   - Should now proceed past the wallet check!

3. **Check Server Logs**
   You should see:
   ```
   🎯 Claim request for campaign xxx by user yyy
   📊 Campaign status: active, Claimed: 0/10
   🔍 Checking eligibility for user yyy...
   ✓ Eligibility result: { eligible: true, reason: 'Open to all users' }
   🔍 Looking up user record for userId: yyy
   📝 User found: Yes (wallet: 0x1be1A3927fA3C29208891C226e340d2c92D39BBE)
   ✅ All checks passed. Proceeding with claim...
   ```

## Error Messages Explained

With the improved logging, you'll now see exactly where the claim fails:

### "Campaign is not active. Current status: {status}"
- Campaign status is not 'active'
- Check campaign status in brand dashboard
- Make sure you activated it after pre-minting

### "No NFTs remaining"
- All NFTs have been claimed
- Check campaign supply vs claimed count

### "Not eligible for this campaign"
- User doesn't meet eligibility requirements
- Check the specific reason in the response
- Examples: "Need 7-day streak", "Must join community"

### "You have already claimed this campaign"
- User already claimed this campaign once
- Each user can only claim once per campaign

### "User profile not found"
- No User record exists for this userId
- Create user profile first

### "Please connect your wallet first"
- **This was your error!**
- Now fixed with wallet connection feature

## API Usage

### Check User Has Wallet
```javascript
GET /api/users/:userId

Response:
{
  "userId": "xxx",
  "email": "user@example.com",
  "walletAddress": "0x...", // ← Should not be null
  ...
}
```

### Set Wallet Address
```javascript
PUT /api/users/:userId
Headers: Authorization: Bearer <token>
Body: {
  "walletAddress": "0x1be1A3927fA3C29208891C226e340d2c92D39BBE"
}
```

## Developer Notes

### Files Modified:

**Frontend:**
- `src/components/dashboard/ProfileEdit.jsx`
  - Added `walletAddress` to profile state
  - Added wallet connection UI section
  - Saves wallet on profile update

**Backend:**
- `server/routes/campaignClaims.js`
  - Added detailed logging for debugging
  - Better error messages with hints
  - Distinguishes between "no user" and "no wallet"

### Wallet Address Validation

The system currently accepts any string as a wallet address. For production, you might want to add validation:

```javascript
// Example validation (add to ProfileEdit.jsx)
const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// In handleSave():
if (profileData.walletAddress && !isValidAddress(profileData.walletAddress)) {
  alert('Please enter a valid Ethereum/U2U wallet address');
  return;
}
```

## Testing Checklist

- [ ] User can see wallet connection section in profile
- [ ] User can enter wallet address in edit mode
- [ ] Wallet address is saved correctly
- [ ] Status shows "Connected" after saving
- [ ] Wallet address is sent in API update request
- [ ] Server logs show wallet address when claiming
- [ ] Claim proceeds past wallet check
- [ ] Error message is clear if wallet not set

## Next Steps

1. **Test the wallet connection** - Set your wallet address in profile
2. **Try claiming again** - Should work now!
3. **Check server logs** - Monitor the detailed output
4. **Report results** - Let me know what error you see next (if any)

## Common Follow-Up Issues

After fixing the wallet issue, you might encounter:

1. **"Campaign is not active"**
   - Go to brand dashboard
   - Make sure campaign status is 'active'
   - Click "Activate Campaign" if needed

2. **Blockchain transaction fails**
   - Check wallet has U2U tokens for gas
   - Verify smart contract is deployed
   - Check blockchain service is initialized

3. **"No pre-minted NFTs available"**
   - Campaign claimed count >= tokenIds length
   - Pre-mint more NFTs or use on-demand minting

## Success Indicators

When everything works correctly, you'll see:
```
🎯 Claim request for campaign xxx by user yyy
📊 Campaign status: active, Claimed: 0/10
🔍 Checking eligibility...
✓ Eligibility result: { eligible: true }
🔍 Looking up user record...
📝 User found: Yes (wallet: 0x...)
✅ All checks passed. Proceeding with claim...
Campaign blockchain data: { preMinted: true, tokenIds: [...] }
Campaign claimed count: 0
Using pre-minted NFTs. Total available: 10
Transferring token ID: 1
```

Then either:
- ✅ NFT transferred successfully
- ✅ NFT minted successfully

And finally:
```json
{
  "message": "NFT claimed successfully",
  "transactionHash": "0x..."
}
```
