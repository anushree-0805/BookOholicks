# 📚 Readora - Web3 Book Community Platform

A decentralized social platform for book lovers that rewards reading engagement with NFTs and blockchain-based rewards. Built with React, Node.js, MongoDB, and Ethereum smart contracts.

---

## 🌟 Platform Overview

**Readora** is a comprehensive web3-enabled book community platform that revolutionizes how readers engage with books, brands, and each other. By combining social networking features with blockchain technology, the platform creates a thriving ecosystem where reading habits are rewarded, communities flourish, and brands can meaningfully connect with their audience through innovative NFT campaigns and loyalty programs.

### What Makes Readora Unique

**For Readers:**
- Transform your daily reading habit into tangible rewards through blockchain-verified NFT badges
- Join vibrant book communities, share reviews, and connect with fellow book lovers
- Earn exclusive NFT rewards for reading streaks, community participation, and achievements
- Claim branded NFTs from your favorite publishers, authors, and bookstores
- Redeem digital NFTs for physical merchandise through our phygital redemption system
- Build a verifiable on-chain portfolio of your reading journey and accomplishments

**For Brands (Publishers, Authors, Bookstores):**
- Launch targeted NFT campaigns to engage with your most loyal readers
- Create digital-only NFT rewards or phygital NFTs with physical merchandise redemption
- Build brand loyalty through gamified reward campaigns tied to reading milestones
- Track campaign performance with real-time analytics and engagement metrics
- Manage end-to-end fulfillment for physical rewards directly through the platform
- Access a captive audience of passionate readers actively seeking new content
- Utilize blockchain for transparent, tamper-proof reward distribution


### Key Features

#### 📖 **Reading & Engagement Tracking**
- **Daily Reading Sessions** - Log reading time and build consistent habits
- **Streak System** - Track consecutive reading days with visual calendar
- **Automatic NFT Rewards** - Earn badges at 7, 30, 90, and 365-day milestones
- **Reading Statistics** - Comprehensive analytics on your reading journey
- **Genre Tracking** - Monitor reading across different book categories

#### 🎨 **Advanced NFT Ecosystem**
- **Multi-Category NFTs** - Streak badges, achievement tokens, campaign rewards, event participation
- **Rarity Tiers** - Common, Rare, Epic, Legendary, and Mythic NFTs
- **ERC-721 Compliance** - Full standard compliance for marketplace compatibility
- **On-Chain Verification** - All rewards verified on blockchain
- **NFT Gallery** - Beautiful collection viewer with filtering and sorting
- **Benefits Tracking** - Each NFT includes redeemable benefits and perks

#### 🏢 **Brand Campaign Platform**
- **Campaign Wizard** - Intuitive 4-step campaign creation process
- **Flexible Targeting** - Set eligibility based on reading streaks, community membership, or custom criteria
- **Pre-Minting System** - Secure escrow wallet management for phygital campaigns
- **Real-Time Analytics** - Monitor claim rates, engagement, and ROI
- **Automated Distribution** - Instant blockchain transfer on user claim
- **Campaign Lifecycle Management** - Draft, approval, activation, and completion workflows

#### 🎁 **Phygital NFT Innovation**
- **Digital-Physical Bridge** - NFTs that unlock physical merchandise redemption
- **Redemption Management** - Full order tracking from request to delivery
- **Shipping Integration** - Multi-region support with tracking numbers
- **Status Updates** - Real-time redemption status for users and brands
- **Fraud Prevention** - One-time redemption locks prevent duplicate claims
- **Flexible Fulfillment** - Brands manage their own shipping and logistics

#### 💎 **Loyalty Rewards Program**
- **Brand Loyalty Tiers** - Progressive rewards for continued engagement with specific brands
- **Points Accumulation** - Earn points through reading, claims, and interactions
- **Exclusive Access** - Early access to new campaigns for loyal community members
- **Tiered Benefits** - Unlock better rewards as you progress through loyalty levels
- **Multi-Brand Tracking** - Separate loyalty status with each brand
- **Redeemable Perks** - Convert loyalty points into exclusive NFTs or physical rewards

#### 👥 **Social Community Features**
- **Book Clubs** - Join genre-specific or general reading communities
- **Global Feed** - Discover posts, reviews, and discussions from across the platform
- **Community Posts** - Share thoughts, reviews, and recommendations
- **Events System** - Participate in or host virtual book clubs and reading events
- **Engagement Rewards** - Earn NFTs for active participation and popular posts
- **User Profiles** - Showcase your reading stats, NFT collection, and achievements

#### 🔗 **Blockchain Integration**
- **Smart Contract Powered** - Solidity contracts on U2U Nebulas Testnet
- **Web3 Wallet Support** - MetaMask and compatible wallet integration
- **Transparent Transactions** - All mints and transfers verifiable on-chain
- **Escrow System** - Secure campaign NFT storage before distribution
- **Batch Operations** - Gas-optimized batch minting for large campaigns
- **Cross-Platform** - NFTs visible in any ERC-721 compatible wallet or marketplace

#### 👨‍💼 **Multi-Role Dashboard System**
- **User Dashboard** - Personal reading stats, streaks, NFT collection, profile management
- **Brand Dashboard** - Campaign creation, analytics, redemption fulfillment, settings
- **Admin Dashboard** - Campaign approvals, platform moderation, ecosystem oversight
- **Role-Based Access** - Secure authentication with Firebase and role-specific permissions

### The Readora Ecosystem

The platform creates a three-way value exchange:

1. **Readers** get rewarded for their passion with NFTs, recognition, and access to exclusive perks
2. **Brands** gain direct access to engaged readers and build lasting loyalty through innovative campaigns
3. **The Community** benefits from increased engagement, quality content, and a thriving book culture

By leveraging blockchain technology, we ensure transparency, verifiable ownership, and true digital asset ownership for all participants. The NFT rewards aren't just digital collectibles—they're keys to exclusive benefits, physical merchandise, and a verifiable record of your reading journey.

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 19.1.1 with React Router
- TailwindCSS for styling
- Vite for build tooling
- Ethers.js for blockchain interaction
- Firebase Authentication
- Axios for API calls

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- Firebase Admin SDK
- Cloudinary for image storage
- Ethers.js for smart contract interaction

**Blockchain:**
- Solidity ^0.8.20
- OpenZeppelin ERC721 contracts
- Hardhat development environment
- U2U Nebulas Testnet deployment



---

## 👥 User Roles & Dashboards

### 1. 📖 **Regular User Dashboard** (`/dashboard`)

**Overview Tab:**
- Reading statistics and activity summary
- Recent achievements and milestones
- Quick stats: Total books, reading streak, NFTs earned

**Profile Tab:**
- Edit profile information
- Upload profile picture (Cloudinary integration)
- Set favorite genres and reading preferences
- Connect Web3 wallet

**Reading Streaks Tab:**
- View current reading streak
- Log daily reading sessions
- Calendar view of reading history
- Streak milestone achievements
- Earn NFT badges for streak milestones:
  - Bronze (7 days)
  - Silver (30 days)
  - Gold (90 days)
  - Platinum (365 days)

**NFT Collection Tab:**
- View all earned NFTs
- Filter by category (Streak, Achievement, Campaign, Event)
- View NFT metadata and benefits
- Phygital NFT redemption status
- Connect/disconnect Web3 wallet
- On-chain NFT verification

**Key Features:**
- Create and share book posts
- Join communities and events
- Browse and claim active campaigns
- Track reading progress
- Earn rewards for engagement

---

### 2. 🏢 **Brand Dashboard** (`/brand-dashboard`)

Brands can create and manage NFT campaigns to engage with the book community.

#### **Analytics Tab**
- Campaign performance metrics
- Total campaigns created
- Active campaigns count
- Total NFTs claimed
- Engagement statistics
- Revenue tracking (if applicable)

#### **Campaigns Tab**
- **Campaign Manager:**
  - View all campaigns (Draft, Pending, Approved, Active, Completed)
  - Filter and search campaigns
  - Quick actions per campaign status

- **Campaign Status Workflow:**
  ```
  Draft → Submit for Approval → Pending Approval → Admin Approves →
  Approved → Pre-Mint NFTs (Phygital) → Activate → Active → Completed
  ```

- **Campaign Actions:**
  - **📝 Submit for Approval** (Draft campaigns)
  - **🔨 Pre-Mint NFTs** (Approved phygital campaigns)
  - **🚀 Activate Campaign** (Approved campaigns)
  - **⏸️ Pause Campaign** (Active campaigns)
  - **📊 View Analytics** (All campaigns)
  - **✏️ Edit** (Draft campaigns)

- **Create Campaign Wizard (4 Steps):**

  **Step 1: Basic Information**
  - Campaign name and description
  - Campaign type (Digital/Phygital)
  - NFT emoji/image selection
  - Start and end dates

  **Step 2: NFT Configuration**
  - Rarity level (Common, Rare, Epic, Legendary, Mythic)
  - Total supply
  - NFT benefits list
  - Metadata configuration

  **Step 3: Eligibility Rules**
  - Open to all
  - Minimum reading streak required
  - Community membership required
  - Custom criteria

  **Step 4: Phygital Settings** (if applicable)
  - Physical item details
  - Redemption settings
  - Shipping regions
  - Fulfillment process

#### **Settings Tab**
- Brand profile management
- Wallet configuration
- Payment settings
- Notification preferences
- API keys and integrations

#### **Phygital Campaign Workflow:**

1. **Create Campaign** → Select "Phygital" type
2. **Configure Physical Item:**
   - Item name and description
   - Estimated value
   - Shipping details
   - Redemption deadline
3. **Submit for Approval**
4. **After Admin Approval:**
   - **Pre-Mint NFTs** to escrow wallet
   - System mints all NFTs to brand's escrow address
   - Stores token IDs in campaign
5. **Activate Campaign** → Users can claim
6. **User Claims:**
   - NFT automatically transfers from escrow to user wallet
   - User can request physical redemption
7. **Fulfill Orders:**
   - View redemption requests
   - Update shipping status
   - Add tracking numbers
   - Mark as delivered

---

### 3. 👨‍💼 **Admin Dashboard** (`/admin`)

Platform administrators manage campaign approvals and platform oversight.

#### **Campaign Approval Interface**

**Pending Approvals:**
- List of all campaigns awaiting approval
- Campaign details review:
  - Brand information
  - Campaign name and description
  - NFT details (rarity, supply, benefits)
  - Phygital status and physical item details
  - Eligibility criteria
  - Timeline (start/end dates)

**Approval Actions:**
- **✓ Approve** - Approve campaign for activation
- **✗ Reject** - Reject with reason
- **📝 Request Changes** - Send feedback to brand

**Admin Controls:**
- Filter campaigns by status
- Search campaigns
- Bulk actions
- Audit log viewing

**Responsibilities:**
- Review campaign quality and legitimacy
- Ensure compliance with platform policies
- Verify brand credentials
- Monitor platform health
- Handle disputes and reports

---

## 🎯 Key Features by User Journey

### **Regular User Journey**

1. **Sign Up / Login**
   - Firebase email/password authentication
   - Profile creation in MongoDB
   - Automatic wallet suggestion for Web3 features

2. **Explore Platform**
   - Browse global feed (`/feed`)
   - Discover communities (`/communities`)
   - View active campaigns (`/campaigns`)

3. **Start Reading Journey**
   - Log reading sessions
   - Build reading streaks
   - Earn streak NFT badges automatically
   - View progress in dashboard

4. **Engage with Community**
   - Create posts about books
   - Join book clubs and communities
   - Participate in events
   - Comment and react to posts

5. **Claim Campaign NFTs**
   - Browse active campaigns
   - Check eligibility automatically
   - Claim NFTs with one click
   - Blockchain transaction handled automatically

6. **Manage NFT Collection**
   - View all earned NFTs in dashboard
   - Connect Web3 wallet to see on-chain NFTs
   - Redeem phygital NFTs for physical items
   - Track redemption status

---

### **Brand Journey**

1. **Register as Brand**
   - Create brand profile
   - Configure wallet settings
   - Set up payment methods

2. **Create Campaign**
   - Use Campaign Wizard
   - Configure NFT details
   - Set eligibility rules
   - Optional: Add physical item for phygital campaign

3. **Submit for Approval**
   - Submit campaign to admin
   - Wait for review
   - Receive approval or feedback

4. **Pre-Mint NFTs** (Phygital campaigns)
   - Execute batch mint to escrow wallet
   - Verify on-chain minting
   - Confirm token IDs stored

5. **Activate Campaign**
   - Make campaign live
   - Users can now claim
   - Monitor real-time claims

6. **Monitor Performance**
   - View analytics
   - Track claim rate
   - Monitor engagement
   - Export reports

7. **Fulfill Physical Orders** (Phygital)
   - View redemption requests
   - Process shipments
   - Update tracking information
   - Mark as delivered

---

### **Admin Journey**

1. **Review Campaign Submissions**
   - Access admin dashboard
   - View pending campaigns
   - Review all campaign details

2. **Approve/Reject Campaigns**
   - Verify brand legitimacy
   - Check campaign quality
   - Ensure policy compliance
   - Approve or reject with feedback

3. **Monitor Platform**
   - Track overall platform health
   - Review user reports
   - Handle disputes
   - Maintain content quality

---



## 📡 API Endpoints

### **User APIs** (`/api/users`)
```
POST   /register               - Register new user
GET    /:userId               - Get user profile
PUT    /:userId               - Update user profile
POST   /:userId/upload        - Upload profile picture
```

### **Campaign APIs** (`/api/campaigns`)
```
POST   /                      - Create campaign (Brand)
GET    /brand/:brandId        - Get brand's campaigns
GET    /active/all           - Get all active campaigns
GET    /:id                  - Get campaign details
PUT    /:id                  - Update campaign
POST   /:id/submit-for-approval - Submit for admin review
POST   /:id/approve          - Approve campaign (Admin)
POST   /:id/reject           - Reject campaign (Admin)
POST   /:id/pre-mint         - Pre-mint NFTs to escrow
PATCH  /:id/status           - Update campaign status
GET    /:id/check-eligibility/:userId - Check user eligibility
```

### **Campaign Claims** (`/api/campaign-claims`)
```
POST   /:campaignId/claim    - Claim NFT from campaign
GET    /user/:userId         - Get user's claims
GET    /campaign/:campaignId - Get campaign claims
```

### **NFT APIs** (`/api/nfts`)
```
POST   /                     - Create NFT record
GET    /user/:userId         - Get user's NFTs
GET    /:id                  - Get NFT details
```

### **Blockchain APIs** (`/api/blockchain`)
```
POST   /mint                 - Mint NFT on-chain
POST   /batch-mint-escrow   - Batch mint to escrow
POST   /transfer-escrow     - Transfer from escrow
GET    /nft/:tokenId        - Get on-chain NFT data
```

### **Community APIs** (`/api/communities`)
```
POST   /                     - Create community
GET    /                     - List communities
GET    /:id                  - Get community details
POST   /:id/join            - Join community
POST   /:id/leave           - Leave community
```

### **Post APIs** (`/api/posts`)
```
POST   /                     - Create post
GET    /global              - Get global feed
GET    /community/:id       - Get community posts
PUT    /:id                 - Update post
DELETE /:id                 - Delete post
POST   /:id/like            - Like post
```

### **Streak APIs** (`/api/streaks`)
```
POST   /                     - Start/update streak
GET    /:userId             - Get user's streak
POST   /:userId/check       - Check streak eligibility for NFT
```

### **Reading Session APIs** (`/api/reading-sessions`)
```
POST   /                     - Log reading session
GET    /:userId             - Get user's sessions
```

### **Event APIs** (`/api/events`)
```
POST   /                     - Create event
GET    /                     - List events
GET    /:id                 - Get event details
POST   /:id/join            - Join event
```

### **Reward APIs** (`/api/rewards`)
```
POST   /                     - Award reward
GET    /:userId             - Get user rewards
```

### **Physical Redemption** (`/api/physical-redemption`)
```
POST   /request             - Request physical redemption
GET    /brand/:brandId      - Get brand's redemptions
PATCH  /:id/status          - Update redemption status
```

---



## 🎁 NFT Reward System

### Automatic Rewards

**Reading Streak NFTs:**
- **Bronze Badge**: 7-day streak
- **Silver Badge**: 30-day streak
- **Gold Badge**: 90-day streak
- **Platinum Badge**: 365-day streak

**Community Rewards:**
- **Active Poster**: 10+ posts
- **Popular Opinion**: Post with 50+ likes
- **Event Participant**: Attend 5+ events
- **Event Organizer**: Host an event

**Achievement Rewards:**
- **Explorer**: Join 5+ communities
- **Genre Master**: Read 20+ books in one genre
- **Review Expert**: Write 50+ reviews

### Campaign Rewards
- Brands create custom NFT campaigns
- Users claim based on eligibility criteria
- Instant blockchain transfer on claim
- Optional physical merchandise redemption

## 🗺️ Project Structure

```
bookoholicks/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── admin/              # Admin dashboard components
│   │   ├── brand/              # Brand dashboard components
│   │   ├── dashboard/          # User dashboard components
│   │   ├── community/          # Community components
│   │   ├── feed/               # Social feed components
│   │   └── common/             # Shared components
│   ├── pages/                   # Page components
│   ├── hooks/                   # Custom React hooks
│   ├── config/                  # Frontend configuration
│   ├── firebase/                # Firebase setup
│   └── App.jsx                  # Main app component
│
├── server/                       # Backend source
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # Express routes
│   ├── services/                # Business logic
│   ├── config/                  # Backend configuration
│   └── server.js               # Entry point
│
├── contracts/                    # Smart contracts
│   ├── BookoholicsNFT.sol      # Main NFT contract
│   └── README.md               # Contract documentation
│
├── scripts/                      # Deployment scripts
│   └── deploy.js               # Contract deployment
│
├── public/                       # Static assets
├── hardhat.config.js            # Hardhat configuration
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies


## 💡 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Book recommendation algorithm
- [ ] Reading challenges and competitions
- [ ] NFT marketplace for trading
- [ ] Multi-chain support
- [ ] AI-powered book summaries
- [ ] Audiobook integration
- [ ] Author verification and special NFTs
- [ ] Advanced analytics dashboard

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section
- Contact the development team

---

**Built with ❤️ for book lovers and blockchain enthusiasts**

*Happy Reading! 📚✨*
