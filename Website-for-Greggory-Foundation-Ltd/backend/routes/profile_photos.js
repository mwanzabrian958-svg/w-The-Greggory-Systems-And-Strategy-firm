// Profile Photos API Routes
// Handles uploading, updating, and retrieving user profile photos
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
// const { verifyToken } = require('../middleware/auth'); // Temporarily disabled

const router = express.Router();

// Configure multer for memory storage (storing files in memory as buffers)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// Upload or update profile photo
router.post('/upload', /* verifyToken, */ upload.single('profilePhoto'), async (req, res) => {
  try {
    // Temporarily use a hardcoded user ID for testing
    const userId = 1; // req.user.id; // Temporarily hardcoded
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided'
      });
    }

    console.log('[Profile Photo] Uploading photo for user:', userId);
    console.log('[Profile Photo] File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Update user record with profile photo data
    const [result] = await req.db.query(
      `UPDATE users 
       SET 
         profile_photo_data = ?,
         profile_photo_name = ?,
         profile_photo_type = ?,
         profile_photo_size = ?,
         profile_photo_uploaded_at = NOW(),
         updated_at = NOW()
       WHERE id = ?`,
      [
        req.file.buffer, // Actual image data as BLOB
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        userId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('[Profile Photo] Upload successful for user:', userId);

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Profile Photo] Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: error.message
    });
  }
});

// Get user profile photo
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    console.log('[Profile Photo] Fetching photo for user:', userId);

    // Get user profile photo data
    const [users] = await req.db.query(
      `SELECT 
         profile_photo_data,
         profile_photo_name,
         profile_photo_type,
         profile_photo_size,
         profile_photo_uploaded_at
       FROM users 
       WHERE id = ? AND deleted_at IS NULL`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    if (!user.profile_photo_data) {
      return res.status(404).json({
        success: false,
        message: 'No profile photo found'
      });
    }

    console.log('[Profile Photo] Found photo for user:', userId);

    // Set appropriate headers
    res.setHeader('Content-Type', user.profile_photo_type || 'image/jpeg');
    res.setHeader('Content-Length', user.profile_photo_size);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.setHeader('Content-Disposition', `inline; filename="${user.profile_photo_name || 'profile-photo'}"`);

    // Send the image data
    res.send(user.profile_photo_data);

  } catch (error) {
    console.error('[Profile Photo] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile photo',
      error: error.message
    });
  }
});

// Delete profile photo
router.delete('/delete', /* verifyToken, */ async (req, res) => {
  try {
    // Temporarily use a hardcoded user ID for testing
    const userId = 1; // req.user.id; // Temporarily hardcoded
    
    console.log('[Profile Photo] Deleting photo for user:', userId);

    // Clear profile photo data from user record
    const [result] = await req.db.query(
      `UPDATE users 
       SET 
         profile_photo_data = NULL,
         profile_photo_name = NULL,
         profile_photo_type = NULL,
         profile_photo_size = NULL,
         profile_photo_uploaded_at = NULL,
         updated_at = NOW()
       WHERE id = ?`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('[Profile Photo] Delete successful for user:', userId);

    res.json({
      success: true,
      message: 'Profile photo deleted successfully'
    });

  } catch (error) {
    console.error('[Profile Photo] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile photo',
      error: error.message
    });
  }
});

// Get profile photo info (metadata only)
router.get('/:userId/info', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    console.log('[Profile Photo] Fetching photo info for user:', userId);

    // Get user profile photo metadata
    const [users] = await req.db.query(
      `SELECT 
         profile_photo_name,
         profile_photo_type,
         profile_photo_size,
         profile_photo_uploaded_at
       FROM users 
       WHERE id = ? AND deleted_at IS NULL`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    if (!user.profile_photo_name) {
      return res.status(404).json({
        success: false,
        message: 'No profile photo found'
      });
    }

    console.log('[Profile Photo] Found photo info for user:', userId);

    res.json({
      success: true,
      data: {
        fileName: user.profile_photo_name,
        fileType: user.profile_photo_type,
        fileSize: user.profile_photo_size,
        uploadedAt: user.profile_photo_uploaded_at
      }
    });

  } catch (error) {
    console.error('[Profile Photo] Info fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile photo info',
      error: error.message
    });
  }
});

module.exports = router;
