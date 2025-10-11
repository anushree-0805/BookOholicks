# Wallet Connection Diagnostic Report

## Issue Summary
Users are unable to claim NFTs from available campaigns despite having connected their wallets. The system shows a "wallet connection" error even when the wallet has been connected.

## Identified Root Causes

Based on my analysis of the codebase, I've identified the following potential issues:

### 1. **User Profile Not Found in Database**
**Location**: `server/routes/campaignClaims.js:60-69`

The claim route checks for a user record using:
```javascript
const user = await User.findOne({ userId });
```

**Problem**: If the user profile doesn't exist in MongoDB (only exists in Firebase Auth), this will return `null` and trigger the error:
```
"User profile not found. Please complete your profile setup."
```

### 2. **Wallet Address Not Saved to Profile**
**Location**: `server/routes/campaignClaims.js:71-77`

Even if the user profile exists, if `walletAddress` is `null` or empty, the error message returned is:
```
"Please connect your wallet first"
```

### 3. **Frontend-Backend Synchronization Issue**
The frontend (`ProfileEdit.jsx`) allows users to edit and save their wallet address, but there might be issues with:
- The save operation not completing successfully
- The user profile not being refreshed after saving
- The wallet address field being saved as an empty string instead of a proper address

## Diagnostic Steps

### Step 1: Check if User Profile Exists in Database

Run this query in MongoDB shell or compass:
```javascript
db.users.findOne({ userId: "<YOUR_FIREBASE_UID>" })
```

**Expected Result**: Should return a user document with fields including `walletAddress`.

**If not found**: The user needs to complete profile setup. The profile is created during sign-up, but might be missing if there was an error during registration.

### Step 2: Verify Wallet Address is Stored

If the user profile exists, check if the `walletAddress` field has a valid value:
```javascript
db.users.findOne(
  { userId: "<YOUR_FIREBASE_UID>" },
  { walletAddress: 1, name: 1, email: 1 }
)
```

**Expected Result**:
```json
{
  "_id": "...",
  "name": "User Name",
  "email": "user@email.com",
  "walletAddress": "0x1234567890abcdef..." // Should be a valid address
}
```

**If `walletAddress` is `null` or empty string**: The wallet connection was not properly saved.

### Step 3: Test Profile Update API

Test the profile update endpoint directly:
```bash
# Get the Firebase ID token from browser console:
# firebase.auth().currentUser.getIdToken()

curl -X PUT http://localhost:5000/api/users/<FIREBASE_UID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -d '{"walletAddress": "0xYourWalletAddressHere"}'
```

**Expected Response**: Should return the updated user object with the new wallet address.

### Step 4: Check Browser Console and Network Tab

When saving the wallet address:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Save Changes" after entering wallet address
4. Look for the PUT request to `/api/users/<uid>`
5. Check the request payload and response

**Common Issues**:
- Request shows `walletAddress: ""` (empty string)
- Response returns an error
- Request fails with 401/403 (authentication issue)
- Request never fires (frontend issue)

## Solutions

### Solution 1: Ensure User Profile Exists

If user profile doesn't exist in MongoDB, create it manually or through the API:

```javascript
// In MongoDB shell
db.users.insertOne({
  userId: "<FIREBASE_UID>",
  email: "<USER_EMAIL>",
  accountType: "reader",
  name: "User Name",
  walletAddress: "0xYourWalletAddressHere", // Important!
  bio: "",
  interestedGenres: [],
  location: "",
  favoriteAuthor: "",
  readingGoal: "50 books/year",
  createdAt: new Date()
})
```

### Solution 2: Fix Wallet Address Validation in Frontend

Add validation to ensure wallet address is properly formatted before saving:

**Location**: `src/components/dashboard/ProfileEdit.jsx:73-122`

Add validation before the save:
```javascript
const handleSave = async () => {
  if (!user) return;

  // Validate wallet address if provided
  if (profileData.walletAddress) {
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(profileData.walletAddress)) {
      alert('Invalid wallet address format. Must start with 0x followed by 40 hexadecimal characters.');
      return;
    }
  }

  try {
    setLoading(true);
    // ... rest of the save logic
  }
}
```

### Solution 3: Add Debug Logging

To better understand where the issue occurs, add logging to the claim process:

**In Backend** (`server/routes/campaignClaims.js`):
```javascript
// After line 59
console.log('🔍 Looking up user record for userId:', userId);
const user = await User.findOne({ userId });
console.log('📝 User found:', user ? `Yes (wallet: ${user.walletAddress || 'none'})` : 'No');
```

**In Frontend** (`src/components/user/AvailableCampaigns.jsx`):
```javascript
// In handleClaim function, before API call
console.log('Attempting claim for campaign:', selectedCampaign._id);
console.log('Current user:', user?.uid);
```

### Solution 4: Force Profile Refresh After Wallet Save

**Location**: `src/components/dashboard/ProfileEdit.jsx:105-106`

Ensure the profile is properly refreshed after saving:
```javascript
// Refresh user profile to get updated data
await refreshUserProfile();

// Add a small delay to ensure the state updates
await new Promise(resolve => setTimeout(resolve, 500));

setIsEditing(false);
alert('Profile updated successfully! Your wallet is now connected.');
```

## Testing the Fix

1. **Update your profile with a valid wallet address**:
   - Go to Profile Edit page
   - Click "Edit Profile"
   - Enter your U2U wallet address (starts with 0x)
   - Click "Save Changes"
   - Verify you see "Profile updated successfully!"

2. **Verify wallet is saved**:
   - Refresh the page
   - Check that your wallet address still appears
   - The "Wallet Connected" status should show "✓ Connected"

3. **Try claiming an NFT**:
   - Go to Available Campaigns
   - Find an eligible campaign
   - Click "Claim NFT"
   - Confirm the claim

4. **Check server logs** for debugging:
   ```
   🔍 Looking up user record for userId: <uid>
   📝 User found: Yes (wallet: 0x...)
   ✅ All checks passed. Proceeding with claim...
   ```

## Quick Fix Command

If you have MongoDB shell access, run this to manually set a wallet address:

```javascript
db.users.updateOne(
  { userId: "<YOUR_FIREBASE_UID>" },
  { $set: { walletAddress: "0xYourWalletAddressHere" } }
)
```

Then refresh your browser and try claiming again.

## Next Steps

1. Check MongoDB to verify user profile exists
2. Verify wallet address is stored correctly
3. Test the profile update API
4. Check browser console for errors
5. Review server logs during claim attempt

If the issue persists after following these steps, please provide:
- Server console output during a claim attempt
- Browser console errors
- Network tab showing the claim API request/response
