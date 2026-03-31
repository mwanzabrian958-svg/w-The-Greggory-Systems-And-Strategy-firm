// Serve Profile Photos API
// Handles serving actual profile photo data from database as images
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get profile photo by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Query user's profile photo data
    const [users] = await db.query(
      'SELECT profile_photo_data, profile_photo_name, profile_photo_type, profile_photo_size, profile_photo_uploaded_at FROM users WHERE id = ? AND profile_photo_data IS NOT NULL AND deleted_at IS NULL',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile photo not found'
      });
    }
    
    const user = users[0];
    
    console.log(`[Profile Photo] Serving photo for user ${userId}:`, {
      fileName: user.profile_photo_name,
      fileSize: user.profile_photo_size,
      mimeType: user.profile_photo_type
    });
    
    // Set appropriate content type
    res.setHeader('Content-Type', user.profile_photo_type || 'image/jpeg');
    res.setHeader('Content-Length', user.profile_photo_size);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.setHeader('ETag', `"${user.profile_photo_uploaded_at.getTime()}"`);
    
    // Send the actual image data
    res.send(user.profile_photo_data);
    
  } catch (error) {
    console.error('[Profile Photo] Error serving photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve profile photo'
    });
  }
});

// Get profile photo URL (for frontend use)
router.get('/url/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user has profile photo
    const [users] = await db.query(
      'SELECT profile_photo_uploaded_at FROM users WHERE id = ? AND profile_photo_data IS NOT NULL AND deleted_at IS NULL',
      [userId]
    );
    
    if (users.length === 0) {
      return res.json({
        success: false,
        message: 'No profile photo found'
      });
    }
    
    const user = users[0];
    
    // Return URL to the profile photo endpoint
    const photoUrl = `${req.protocol}://${req.get('host')}/api/profile-photos/user/${userId}`;
    
    res.json({
      success: true,
      data: {
        photoUrl: photoUrl,
        fileName: user.profile_photo_name,
        uploadedAt: user.profile_photo_uploaded_at
      }
    });
    
  } catch (error) {
    console.error('[Profile Photo] Error getting photo URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile photo URL'
    });
  }
});

module.exports = router;
