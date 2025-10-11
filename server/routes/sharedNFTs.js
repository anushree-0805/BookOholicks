import express from 'express';
import SharedNFT from '../models/SharedNFT.js';
import NFT from '../models/NFT.js';
import User from '../models/User.js';
import { verifyToken } from '../config/firebase.js';

const router = express.Router();

// Share an NFT to the community
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nftId, caption } = req.body;
    const userId = req.user.uid;

    // Verify NFT exists and belongs to user
    const nft = await NFT.findById(nftId);
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    if (nft.userId !== userId) {
      return res.status(403).json({ message: 'You do not own this NFT' });
    }

    // Check if already shared
    const existingShare = await SharedNFT.findOne({ nftId, userId });
    if (existingShare) {
      return res.status(400).json({
        message: 'NFT already shared. You can update your caption instead.',
        sharedNFT: existingShare
      });
    }

    // Get user info
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create shared NFT
    const sharedNFT = new SharedNFT({
      nftId,
      userId,
      userName: user.name,
      userProfilePic: user.profilePic,
      caption: caption || '',
      isPublic: true
    });

    await sharedNFT.save();

    // Populate NFT data for response
    const populatedShare = await SharedNFT.findById(sharedNFT._id).populate('nftId');

    res.status(201).json({
      message: 'NFT shared successfully',
      sharedNFT: populatedShare
    });
  } catch (error) {
    console.error('Error sharing NFT:', error);
    res.status(500).json({ message: 'Error sharing NFT', error: error.message });
  }
});

// Get all shared NFTs (community gallery)
router.get('/gallery', async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'recent' } = req.query;
    const skip = (page - 1) * limit;

    let sortCriteria = {};
    switch (sortBy) {
      case 'popular':
        sortCriteria = { 'likes': -1, sharedAt: -1 };
        break;
      case 'trending':
        sortCriteria = { views: -1, sharedAt: -1 };
        break;
      case 'recent':
      default:
        sortCriteria = { sharedAt: -1 };
    }

    const sharedNFTs = await SharedNFT.find({ isPublic: true })
      .populate('nftId')
      .sort(sortCriteria)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await SharedNFT.countDocuments({ isPublic: true });

    res.json({
      sharedNFTs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Error fetching gallery', error: error.message });
  }
});

// Get user's shared NFTs
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const sharedNFTs = await SharedNFT.find({ userId })
      .populate('nftId')
      .sort({ sharedAt: -1 });

    res.json(sharedNFTs);
  } catch (error) {
    console.error('Error fetching user shared NFTs:', error);
    res.status(500).json({ message: 'Error fetching shared NFTs', error: error.message });
  }
});

// Get single shared NFT details
router.get('/:sharedNFTId', async (req, res) => {
  try {
    const sharedNFT = await SharedNFT.findById(req.params.sharedNFTId)
      .populate('nftId');

    if (!sharedNFT) {
      return res.status(404).json({ message: 'Shared NFT not found' });
    }

    // Increment view count
    sharedNFT.views += 1;
    await sharedNFT.save();

    res.json(sharedNFT);
  } catch (error) {
    console.error('Error fetching shared NFT:', error);
    res.status(500).json({ message: 'Error fetching shared NFT', error: error.message });
  }
});

// Update shared NFT caption
router.put('/:sharedNFTId', verifyToken, async (req, res) => {
  try {
    const { caption } = req.body;
    const userId = req.user.uid;

    const sharedNFT = await SharedNFT.findById(req.params.sharedNFTId);
    if (!sharedNFT) {
      return res.status(404).json({ message: 'Shared NFT not found' });
    }

    if (sharedNFT.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this shared NFT' });
    }

    sharedNFT.caption = caption;
    await sharedNFT.save();

    const updated = await SharedNFT.findById(sharedNFT._id).populate('nftId');
    res.json({ message: 'Caption updated successfully', sharedNFT: updated });
  } catch (error) {
    console.error('Error updating shared NFT:', error);
    res.status(500).json({ message: 'Error updating shared NFT', error: error.message });
  }
});

// Delete shared NFT
router.delete('/:sharedNFTId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const sharedNFT = await SharedNFT.findById(req.params.sharedNFTId);
    if (!sharedNFT) {
      return res.status(404).json({ message: 'Shared NFT not found' });
    }

    if (sharedNFT.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this shared NFT' });
    }

    await SharedNFT.findByIdAndDelete(req.params.sharedNFTId);
    res.json({ message: 'Shared NFT removed successfully' });
  } catch (error) {
    console.error('Error deleting shared NFT:', error);
    res.status(500).json({ message: 'Error deleting shared NFT', error: error.message });
  }
});

// Like a shared NFT
router.post('/:sharedNFTId/like', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const sharedNFT = await SharedNFT.findById(req.params.sharedNFTId);

    if (!sharedNFT) {
      return res.status(404).json({ message: 'Shared NFT not found' });
    }

    // Check if already liked
    const alreadyLiked = sharedNFT.likes.some(like => like.userId === userId);

    if (alreadyLiked) {
      // Unlike
      sharedNFT.likes = sharedNFT.likes.filter(like => like.userId !== userId);
      await sharedNFT.save();
      return res.json({ message: 'Like removed', liked: false, likeCount: sharedNFT.likes.length });
    } else {
      // Like
      sharedNFT.likes.push({ userId, likedAt: new Date() });
      await sharedNFT.save();
      return res.json({ message: 'NFT liked', liked: true, likeCount: sharedNFT.likes.length });
    }
  } catch (error) {
    console.error('Error liking NFT:', error);
    res.status(500).json({ message: 'Error liking NFT', error: error.message });
  }
});

// Comment on a shared NFT
router.post('/:sharedNFTId/comment', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.uid;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const sharedNFT = await SharedNFT.findById(req.params.sharedNFTId);
    if (!sharedNFT) {
      return res.status(404).json({ message: 'Shared NFT not found' });
    }

    // Get user info
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    sharedNFT.comments.push({
      userId,
      userName: user.name,
      userProfilePic: user.profilePic,
      text: text.trim(),
      createdAt: new Date()
    });

    await sharedNFT.save();

    res.json({
      message: 'Comment added successfully',
      comment: sharedNFT.comments[sharedNFT.comments.length - 1],
      commentCount: sharedNFT.comments.length
    });
  } catch (error) {
    console.error('Error commenting on NFT:', error);
    res.status(500).json({ message: 'Error commenting on NFT', error: error.message });
  }
});

// Delete a comment
router.delete('/:sharedNFTId/comment/:commentId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { sharedNFTId, commentId } = req.params;

    const sharedNFT = await SharedNFT.findById(sharedNFTId);
    if (!sharedNFT) {
      return res.status(404).json({ message: 'Shared NFT not found' });
    }

    const comment = sharedNFT.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only comment owner or shared NFT owner can delete
    if (comment.userId !== userId && sharedNFT.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    sharedNFT.comments.pull(commentId);
    await sharedNFT.save();

    res.json({ message: 'Comment deleted successfully', commentCount: sharedNFT.comments.length });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

export default router;
