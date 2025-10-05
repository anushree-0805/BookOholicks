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
    res.json(user.toObject());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user profile
router.post('/', verifyToken, async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser.toObject());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user profile
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    console.log('Update user profile request:', {
      userId: req.params.userId,
      body: req.body
    });

    // Validate accountType if provided
    const validAccountTypes = ['reader', 'brand'];
    if (req.body.accountType && !validAccountTypes.includes(req.body.accountType)) {
      return res.status(400).json({
        message: 'Invalid account type',
        error: `Account type must be one of: ${validAccountTypes.join(', ')}`
      });
    }

    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log('User not found:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User updated successfully:', user._id);
    const userObj = user.toObject();
    console.log('Sending user response:', JSON.stringify(userObj).substring(0, 100) + '...');
    res.json(userObj);
  } catch (error) {
    console.error('Error updating user profile:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors,
        details: error.message
      });
    }

    // Handle cast errors (invalid data types)
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid data type',
        error: error.message
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate value',
        error: 'A user with this email or userId already exists'
      });
    }

    res.status(500).json({
      message: 'Error updating user',
      error: error.message,
      details: error.toString()
    });
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

    res.json({ profilePicUrl: req.file.path, user: user.toObject() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
