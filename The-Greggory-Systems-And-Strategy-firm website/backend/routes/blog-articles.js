const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT *
      FROM blog_articles
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching blog articles:', error);
    res.status(500).json({ error: 'Failed to fetch blog articles' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.promise().query('SELECT * FROM blog_articles WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Blog article not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching blog article:', error);
    res.status(500).json({ error: 'Failed to fetch blog article' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, excerpt, content, author, read_time, category, image_url, image_id, icon_class, is_published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const [result] = await db.promise().query(
      `INSERT INTO blog_articles (title, excerpt, content, author, read_time, category, image_url, image_id, icon_class, is_published, published_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, excerpt || null, content, author || null, read_time || null, category || null, image_url || null, image_id || null, icon_class || null, Boolean(is_published), is_published ? new Date() : null]
    );

    res.status(201).json({ message: 'Blog article created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating blog article:', error);
    res.status(500).json({ error: 'Failed to create blog article' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, author, read_time, category, image_url, image_id, icon_class, is_published } = req.body;

    const [result] = await db.promise().query(
      `UPDATE blog_articles
       SET title = ?, excerpt = ?, content = ?, author = ?, read_time = ?, category = ?, image_url = ?, image_id = ?, icon_class = ?, is_published = ?, published_date = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, excerpt || null, content, author || null, read_time || null, category || null, image_url || null, image_id || null, icon_class || null, Boolean(is_published), is_published ? new Date() : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog article not found' });
    }

    res.json({ message: 'Blog article updated successfully' });
  } catch (error) {
    console.error('Error updating blog article:', error);
    res.status(500).json({ error: 'Failed to update blog article' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.promise().query('DELETE FROM blog_articles WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog article not found' });
    }

    res.json({ message: 'Blog article deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog article:', error);
    res.status(500).json({ error: 'Failed to delete blog article' });
  }
});

module.exports = router;
