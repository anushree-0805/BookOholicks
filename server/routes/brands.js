import express from 'express';
import Brand from '../models/Brand.js';
import { verifyToken } from '../config/firebase.js';

const router = express.Router();

// Get brand profile by userId
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const brand = await Brand.findOne({ userId: req.params.userId });
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(brand);
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
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error creating brand', error: error.message });
  }
});

// Update brand profile
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    const brand = await Brand.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error updating brand', error: error.message });
  }
});

// Upload brand logo
router.post('/:userId/logo', verifyToken, async (req, res) => {
  try {
    const { logoUrl } = req.body;
    const brand = await Brand.findOneAndUpdate(
      { userId: req.params.userId },
      { logo: logoUrl },
      { new: true }
    );
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading logo', error: error.message });
  }
});

export default router;
