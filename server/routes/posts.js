import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { verifyToken } from '../config/firebase.js';

const router = express.Router();

// Get global feed
router.get('/feed', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, filter = 'recent' } = req.query;
    const skip = (page - 1) * limit;

    let sortOption = { createdAt: -1 };
    if (filter === 'popular') {
      sortOption = { 'stats.likeCount': -1, createdAt: -1 };
    } else if (filter === 'trending') {
      sortOption = { 'stats.viewCount': -1, createdAt: -1 };
    }

    const posts = await Post.find({ isPublic: true })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Fetch user details for each post
    const userIds = [...new Set(posts.map(p => p.userId))];
    const users = await User.find({ userId: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map(u => [u.userId, u]));

    const postsWithUserData = posts.map(post => ({
      ...post,
      user: userMap[post.userId] || { name: 'Unknown User' }
    }));

    res.json(postsWithUserData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feed', error: error.message });
  }
});

// Get single post
router.get('/:postId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await User.findOne({ userId: post.userId });
    res.json({ ...post.toObject(), user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Create post
router.post('/', verifyToken, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      userId: req.user.uid
    });
    await post.save();

    // Update community post count if posted to community
    if (post.communityId) {
      await Community.findByIdAndUpdate(post.communityId, {
        $inc: { 'stats.postCount': 1 }
      });
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Like post
router.post('/:postId/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.uid;
    const alreadyLiked = post.likes.some(like => like.userId === userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(like => like.userId !== userId);
      post.stats.likeCount = Math.max(0, post.stats.likeCount - 1);
    } else {
      // Like
      post.likes.push({ userId, timestamp: new Date() });
      post.stats.likeCount += 1;
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
});

// Comment on post
router.post('/:postId/comment', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      userId: req.user.uid,
      text,
      timestamp: new Date()
    });
    post.stats.commentCount += 1;

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error commenting', error: error.message });
  }
});

// Repost
router.post('/:postId/repost', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.uid;
    const alreadyReposted = post.reposts.some(repost => repost.userId === userId);

    if (alreadyReposted) {
      return res.status(400).json({ message: 'Already reposted' });
    }

    post.reposts.push({ userId, timestamp: new Date() });
    post.stats.repostCount += 1;

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error reposting', error: error.message });
  }
});

// Delete post
router.delete('/:postId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// Get user's posts
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user posts', error: error.message });
  }
});

export default router;
