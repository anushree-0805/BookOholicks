import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../config/firebase.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Get user profile
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user profile
router.post('/', verifyToken, async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user profile
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload profile picture
router.post('/:userId/profile-pic', verifyToken, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { profilePic: req.file.path },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ profilePicUrl: req.file.path, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
