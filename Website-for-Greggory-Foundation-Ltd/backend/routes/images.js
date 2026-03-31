const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAuth } = require('../middleware/jwtAuth');

// Get image by ID (for video display)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [images] = await db.query(
      'SELECT * FROM images WHERE id = ? AND is_public = TRUE AND deleted_at IS NULL',
      [id]
    );
    
    if (images.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }
    
    const image = images[0];
    res.json({
      success: true,
      image: {
        id: image.id,
        file_name: image.file_name,
        file_path: image.file_path,
        file_type: image.file_type,
        alt_text: image.alt_text,
        title: image.title,
        width: image.width,
        height: image.height
      }
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch image' 
    });
  }
});

// Upload profile image (used by signup / profile update)
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const { file_name, file_path, file_type, file_size, alt_text, title, width, height } = req.body;
    
    if (!file_name || !file_path) {
      return res.status(400).json({ 
        success: false, 
        message: 'File name and path are required' 
      });
    }
    
    const [result] = await db.query(
      `INSERT INTO images (file_name, file_path, file_type, file_size, alt_text, title, width, height, is_public, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [file_name, file_path, file_type, file_size || 0, alt_text || null, title || null, width || null, height || null, req.user.id]
    );
    
    res.status(201).json({
      success: true,
      image_id: result.insertId
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload image' 
    });
  }
});

// Delete image (admin only or owner)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user owns the image or is admin
    const [images] = await db.query(
      'SELECT created_by FROM images WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (images.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }
    
    const image = images[0];
    
    // Allow deletion if user is admin or owns the image
    if (req.user.role !== 'admin' && image.created_by !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own images' 
      });
    }
    
    // Soft delete
    await db.query(
      'UPDATE images SET deleted_at = NOW(), deleted_by = ? WHERE id = ?',
      [req.user.id, id]
    );
    
    res.json({ 
      success: true, 
      message: 'Image deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete image' 
    });
  }
});

// Get all public images (for admin/gallery)
router.get('/', async (req, res) => {
  try {
    const [images] = await db.query(
      'SELECT * FROM images WHERE is_public = TRUE AND deleted_at IS NULL ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      images: images.map(img => ({
        id: img.id,
        file_name: img.file_name,
        file_path: img.file_path,
        file_type: img.file_type,
        alt_text: img.alt_text,
        title: img.title,
        width: img.width,
        height: img.height,
        created_at: img.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch images' 
    });
  }
});

module.exports = router;
