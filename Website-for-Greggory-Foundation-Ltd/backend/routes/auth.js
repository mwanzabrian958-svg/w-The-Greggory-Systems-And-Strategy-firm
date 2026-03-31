const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  register, 
  login, 
  getProfile, 
  protect, 
  authorize,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/authController');

// Multer setup for photo uploads (reuses uploaded file from server middleware)
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Backend is working!' });
});

// Test endpoint - get all users
router.get('/users-list', async (req, res) => {
  try {
    const db = require('../config/database');
    const [users] = await db.query('SELECT id, email, first_name, last_name, created_at FROM users');
    return res.json({
      success: true,
      totalUsers: users.length,
      users: users
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Simple registration - test first
router.post('/register-simple', async (req, res) => {
  try {
    console.log('[REGISTER-SIMPLE] Body:', req.body);
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: email, password, firstName, lastName' 
      });
    }

    // For testing - just insert directly without all the complex logic
    const db = require('../config/database');
    
    // Get role first
    const [roles] = await db.query('SELECT id FROM roles WHERE name = ?', ['user']);
    if (!roles || roles.length === 0) {
      return res.status(500).json({ 
        success: false, 
        message: 'User role not found. Database may not be initialized.' 
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, TRUE, FALSE)`,
      [email, hashedPassword, firstName, lastName, roles[0].id]
    );

    console.log('[REGISTER-SIMPLE] User created with ID:', result.insertId);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      userId: result.insertId
    });
  } catch (error) {
    console.error('[REGISTER-SIMPLE] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message
    });
  }
});

// Public routes
router.post('/register', upload.single('photo'), register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/profile', protect, getProfile);

// Admin only route example
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Admin access granted' });
});

module.exports = router;
