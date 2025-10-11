import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../config/firebase.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Get user profile
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    console.log('📥 GET user profile request for userId:', req.params.userId);

    const user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      console.log('❌ User not found:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found:', user._id);

    // Convert to plain object and ensure it's serializable
    const userObj = user.toObject();
    const cleanUserObj = {
      _id: userObj._id,
      userId: userObj.userId,
      email: userObj.email,
      accountType: userObj.accountType,
      name: userObj.name,
      bio: userObj.bio,
      profilePic: userObj.profilePic,
      interestedGenres: userObj.interestedGenres,
      location: userObj.location,
      favoriteAuthor: userObj.favoriteAuthor,
      readingGoal: userObj.readingGoal,
      walletAddress: userObj.walletAddress,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt
    };

    console.log('📤 Sending user profile response');
    res.json(cleanUserObj);
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message
    });
    res.status(500).json({
      message: 'Error fetching user profile',
      error: error.message
    });
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

    // Convert to plain object and ensure it's serializable
    const userObj = user.toObject();

    // Remove any circular references or non-serializable fields
    const cleanUserObj = {
      _id: userObj._id,
      userId: userObj.userId,
      email: userObj.email,
      accountType: userObj.accountType,
      name: userObj.name,
      bio: userObj.bio,
      profilePic: userObj.profilePic,
      interestedGenres: userObj.interestedGenres,
      location: userObj.location,
      favoriteAuthor: userObj.favoriteAuthor,
      readingGoal: userObj.readingGoal,
      walletAddress: userObj.walletAddress,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt
    };

    console.log('Sending user response:', JSON.stringify(cleanUserObj).substring(0, 100) + '...');
    res.json(cleanUserObj);
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors,
        details: error.message
      });
    }

    // Handle cast errors (invalid data types)
    if (error.name === 'CastError') {
      console.error('Cast error details:', error);
      return res.status(400).json({
        message: 'Invalid data type',
        error: error.message
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      console.error('Duplicate key error:', error);
      return res.status(400).json({
        message: 'Duplicate value',
        error: 'A user with this email or userId already exists'
      });
    }

    // Generic error response
    console.error('Sending 500 error response:', {
      message: error.message,
      name: error.name,
      code: error.code
    });

    res.status(500).json({
      message: 'Error updating user',
      error: error.message,
      errorName: error.name,
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
