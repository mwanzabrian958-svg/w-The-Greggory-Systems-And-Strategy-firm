// Content Management API Routes
// Handles CRUD operations for website content (blog, services, team, etc.)
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAuth } = require('../middleware/jwtAuth');

// Get all blog posts
router.get('/blog', requireAuth, async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT bp.*, u.first_name, u.last_name 
       FROM blog_posts bp 
       LEFT JOIN users u ON bp.author_id = u.id 
       WHERE bp.deleted_at IS NULL 
       ORDER BY bp.published_at DESC`
    );
    
    res.json({
      success: true,
      data: posts.map(post => ({
        ...post,
        author: `${post.first_name} ${post.last_name || ''}`.trim()
      }))
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new blog post
router.post('/blog', requireAuth, async (req, res) => {
  try {
    const { title, slug, excerpt, content, category_id, featured_image_id, status } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    
    const [result] = await db.query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, category_id, featured_image_id, author_id, status, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())`,
      [title, slug || title.toLowerCase().replace(/\s+/g, '-'), excerpt, content, category_id || null, featured_image_id || null, req.user.id]
    );
    
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update blog post
router.put('/blog/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, category_id, featured_image_id, status } = req.body;
    
    const [result] = await db.query(
      `UPDATE blog_posts 
       SET title = ?, slug = ?, excerpt = ?, content = ?, category_id = ?, featured_image_id = ?, status = ?, updated_at = NOW()
       WHERE id = ? AND deleted_at IS NULL`,
      [title, slug || title.toLowerCase().replace(/\s+/g, '-'), excerpt, content, category_id || null, featured_image_id || null, status || 'draft', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete blog post
router.delete('/blog/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      `UPDATE blog_posts SET deleted_at = NOW(), deleted_by = ? WHERE id = ? AND deleted_at IS NULL`,
      [req.user.id, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all services
router.get('/services', requireAuth, async (req, res) => {
  try {
    const [services] = await db.query(
      'SELECT * FROM services WHERE deleted_at IS NULL ORDER BY sort_order ASC'
    );
    
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new service
router.post('/services', requireAuth, async (req, res) => {
  try {
    const { title, description, icon, link } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    
    const [result] = await db.query(
      `INSERT INTO services (title, description, icon, link, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM services), NOW(), NOW())`,
      [title, description, icon, link]
    );
    
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update service
router.put('/services/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, link, sort_order } = req.body;
    
    const [result] = await db.query(
      `UPDATE services 
       SET title = ?, description = ?, icon = ?, link = ?, sort_order = ?, updated_at = NOW()
       WHERE id = ? AND deleted_at IS NULL`,
      [title, description, icon, link, sort_order, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete service
router.delete('/services/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      `UPDATE services SET deleted_at = NOW(), deleted_by = ? WHERE id = ? AND deleted_at IS NULL`,
      [req.user.id, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
