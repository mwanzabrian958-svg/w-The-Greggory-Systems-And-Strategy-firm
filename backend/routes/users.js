const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const requireAdmin = require('../middleware/auth');
const authController = require('../controllers/authController');

// Test registration endpoint
router.post('/test-register', async (req, res) => {
  try {
    console.log('Test registration request received:', req.body);
    
    const { email, password, name, userType } = req.body;
    
    // Basic validation
    if (!email || !password || !name) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const [existing] = await db.promise().query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );
    
    if (existing.length > 0) {
      console.log('User already exists:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await db.promise().query(
      'INSERT INTO users (email, password_hash, name, primary_role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, userType || 'user']
    );

    console.log('User created successfully:', result.insertId);
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

// Google Authentication
router.post('/google-auth', authController.googleAuth);

// Get all users (admin only)
router.get('/', requireAdmin, (req, res) => {
  const query = `
    SELECT u.id, u.email, u.name, u.primary_role, u.is_active, u.created_at, u.last_login,
           tm.name as job_title, tm.role as job_role
    FROM users u
    LEFT JOIN team_members tm ON u.job_id = tm.id
    ORDER BY u.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    res.json(results);
  });
});

// Get user by ID (admin only)
router.get('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT u.id, u.email, u.name, u.primary_role, u.is_active, u.created_at, u.last_login,
           tm.name as job_title, tm.role as job_role
    FROM users u
    LEFT JOIN team_members tm ON u.job_id = tm.id
    WHERE u.id = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(results[0]);
  });
});

// Create new user (used by admin + public signup)
router.post('/', async (req, res) => {
  try {
    const { email, password_hash, name, primary_role, job_id, profile_image_id } = req.body;
    if (!email || !password_hash || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashed = await bcrypt.hash(password_hash, 10);

    const query = `
      INSERT INTO users (email, password_hash, name, primary_role, job_id, profile_image_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [email, hashed, name, primary_role || 'employee', job_id, profile_image_id || null], (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      res.status(201).json({
        message: 'User created successfully',
        user_id: result.insertId
      });
    });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Delete user (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM users WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

// Simple login endpoint (mock - would need proper authentication)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = `
    SELECT u.*, tm.name as job_title, tm.role as job_role
    FROM users u
    LEFT JOIN team_members tm ON u.job_id = tm.id
    WHERE u.email = ? AND u.is_active = true
  `;

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Login failed' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    try {
      const ok = await bcrypt.compare(password, user.password_hash || '');
      if (!ok) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (e) {
      console.error('Password compare error:', e);
      return res.status(500).json({ error: 'Login failed' });
    }

    // Update last login
    db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Return user info (without password hash)
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      primary_role: user.primary_role,
      job_title: user.job_title,
      job_role: user.job_role
    });
  });
});

module.exports = router;
