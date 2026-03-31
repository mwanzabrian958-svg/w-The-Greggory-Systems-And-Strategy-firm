const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 as test');
    res.json({ success: true, message: 'Database connection successful', data: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Test insert into users table
router.post('/test-insert', async (req, res) => {
  try {
    const { name, email } = req.body;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, 'testpassword']
    );
    res.json({ 
      success: true, 
      message: 'Test user created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Test insert error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Test insert failed', 
      error: error.message 
    });
  }
});

// Test select from users table
router.get('/test-users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, created_at FROM users');
    res.json({ success: true, users: rows });
  } catch (error) {
    console.error('Test select error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Test select failed', 
      error: error.message 
    });
  }
});

module.exports = router;
