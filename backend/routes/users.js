const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all users (admin only)
router.get('/', (req, res) => {
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

// Get user by ID
router.get('/:id', (req, res) => {
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

// Create new user (admin only)
router.post('/', (req, res) => {
  const { email, password_hash, name, primary_role, job_id } = req.body;
  
  const query = `
    INSERT INTO users (email, password_hash, name, primary_role, job_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(query, [email, password_hash, name, primary_role || 'employee', job_id], (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    res.status(201).json({ 
      message: 'User created successfully', 
      user_id: result.insertId 
    });
  });
});

// Simple login endpoint (mock - would need proper authentication)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // This is a mock implementation - in production, you'd verify password hash
  const query = `
    SELECT u.*, tm.name as job_title, tm.role as job_role
    FROM users u
    LEFT JOIN team_members tm ON u.job_id = tm.id
    WHERE u.email = ? AND u.is_active = true
  `;
  
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Login failed' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = results[0];
    
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
