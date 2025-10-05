import express from 'express';
import Brand from '../models/Brand.js';
import { verifyToken } from '../config/firebase.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Get brand profile by userId
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const brand = await Brand.findOne({ userId: req.params.userId });
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(brand.toObject());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brand', error: error.message });
  }
});

// Create brand profile
router.post('/', verifyToken, async (req, res) => {
  try {
    const existingBrand = await Brand.findOne({ userId: req.body.userId });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand profile already exists' });
    }

    const brand = new Brand(req.body);
    await brand.save();
    res.status(201).json(brand.toObject());
  } catch (error) {
    res.status(500).json({ message: 'Error creating brand', error: error.message });
  }
});

// Update brand profile
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    console.log('Update brand profile request:', {
      userId: req.params.userId,
      body: req.body
    });

    // Validate category if provided
    const validCategories = ['bookstore', 'publisher', 'author', 'event', 'other'];
    if (req.body.category && !validCategories.includes(req.body.category)) {
      return res.status(400).json({
        message: 'Invalid category',
        error: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    const brand = await Brand.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!brand) {
      console.log('Brand not found:', req.params.userId);
      return res.status(404).json({ message: 'Brand not found' });
    }

    console.log('Brand updated successfully:', brand._id);
    res.json(brand.toObject());
  } catch (error) {
    console.error('Error updating brand profile:', error);

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

    res.status(500).json({
      message: 'Error updating brand',
      error: error.message,
      details: error.toString()
    });
  }
});

// Upload brand logo
router.post('/:userId/logo', verifyToken, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const brand = await Brand.findOneAndUpdate(
      { userId: req.params.userId },
      { logo: req.file.path },
      { new: true }
    );

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json({ logoUrl: req.file.path, brand: brand.toObject() });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading logo', error: error.message });
  }
});

export default router;
