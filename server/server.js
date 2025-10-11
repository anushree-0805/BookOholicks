import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST before any other imports
dotenv.config({ path: join(__dirname, '.env') });

// Debug: Verify env vars loaded
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI?.substring(0, 20) + '...');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import usersRouter from './routes/users.js';
import streaksRouter from './routes/streaks.js';
import nftsRouter from './routes/nfts.js';
import sessionsRouter from './routes/sessions.js';
import brandsRouter from './routes/brands.js';
import campaignsRouter from './routes/campaigns.js';
import campaignClaimsRouter from './routes/campaignClaims.js';
import physicalRedemptionRouter from './routes/physicalRedemption.js';
import postsRouter from './routes/posts.js';
import communitiesRouter from './routes/communities.js';
import milestonesRouter from './routes/milestones.js';
import eventsRouter from './routes/events.js';
import rewardsRouter from './routes/rewards.js';
import blockchainRouter from './routes/blockchain.js';
import sharedNFTsRouter from './routes/sharedNFTs.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', usersRouter);
app.use('/api/streaks', streaksRouter);
app.use('/api/nfts', nftsRouter);
app.use('/api/reading-sessions', sessionsRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/campaign-claims', campaignClaimsRouter);
app.use('/api/physical-redemption', physicalRedemptionRouter);
app.use('/api/posts', postsRouter);
app.use('/api/communities', communitiesRouter);
app.use('/api/milestones', milestonesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/blockchain', blockchainRouter);
app.use('/api/shared-nfts', sharedNFTsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
