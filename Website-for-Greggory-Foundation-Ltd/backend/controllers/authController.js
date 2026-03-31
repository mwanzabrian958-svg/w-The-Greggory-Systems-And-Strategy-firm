const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role_name || 'user'
    },
    process.env.JWT_SECRET || '***REMOVED***',
    { expiresIn: '7d' }
  );
};

// Register a new user with optional photo upload
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const photoFile = req.file;

    console.log('[REGISTER] Received registration request:', { email, firstName, lastName, hasPhoto: !!photoFile });

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      console.log('[REGISTER] Validation failed - missing fields');
      if (photoFile) fs.unlinkSync(photoFile.path);
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    console.log('[REGISTER] Checking if user exists...');
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );
    
    if (existing.length > 0) {
      console.log('[REGISTER] User already exists');
      if (photoFile) fs.unlinkSync(photoFile.path);
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    console.log('[REGISTER] Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get default user role
    console.log('[REGISTER] Getting default user role...');
    const [roles] = await db.query(
      'SELECT id FROM roles WHERE name = ?', 
      ['user']
    );

    if (roles.length === 0) {
      console.log('[REGISTER] Default user role not found');
      if (photoFile) fs.unlinkSync(photoFile.path);
      return res.status(500).json({ 
        success: false, 
        message: 'Default user role not found' 
      });
    }

    console.log('[REGISTER] Using role_id:', roles[0].id);

    // Handle photo upload to images table if provided
    let profilePhotoId = null;
    if (photoFile) {
      const photoPath = `/uploads/${photoFile.filename}`;
      try {
        console.log('[REGISTER] Inserting image...');
        const [imageResult] = await db.query(
          `INSERT INTO images (file_name, file_path, file_type, file_size, alt_text, is_public, created_by)
           VALUES (?, ?, ?, ?, ?, TRUE, ?)`,
          [photoFile.originalname, photoPath, photoFile.mimetype, photoFile.size, `Profile photo for ${firstName} ${lastName}`, 1]
        );
        profilePhotoId = imageResult.insertId;
        console.log('[REGISTER] Image inserted with ID:', profilePhotoId);
      } catch (imgErr) {
        console.error('[REGISTER] Image insertion error:', imgErr);
        fs.unlinkSync(photoFile.path);
        return res.status(500).json({
          success: false,
          message: 'Failed to save profile photo'
        });
      }
    }

    // Create user
    console.log('[REGISTER] Inserting user into database...');
    const [result] = await db.query(
      `INSERT INTO users 
       (email, password_hash, first_name, last_name, role_id, profile_photo_id, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, FALSE)`,
      [email, hashedPassword, firstName, lastName, roles[0].id, profilePhotoId]
    );

    console.log('[REGISTER] User inserted with ID:', result.insertId);

    // Generate verification token
    const verificationToken = uuidv4();
    await db.query(
      'UPDATE users SET email_verification_token = ? WHERE id = ?',
      [verificationToken, result.insertId]
    );

    // TODO: Send verification email
    console.log(`[REGISTER] Verification link: http://localhost:5173/verify-email?token=${verificationToken}`);

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: result.insertId,
      profilePhotoId: profilePhotoId
    });

  } catch (error) {
    console.error('[REGISTER] Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed',
      error: error.message 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Get user with role
    const [users] = await db.query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND u.deleted_at IS NULL
    `, [email]);

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact support.' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate token
    const token = generateToken(user);

    // Remove sensitive data
    const { password_hash, ...userData } = user;

    res.json({ 
      success: true, 
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed',
      error: error.message 
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.display_name, 
             u.phone_number, u.profile_photo_id, u.timezone, u.locale,
             r.name as role_name, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND u.deleted_at IS NULL
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      user: users[0] 
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user profile',
      error: error.message 
    });
  }
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '***REMOVED***');
      
      // Get user from token
      const [users] = await db.query(`
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ? AND u.is_active = TRUE AND u.deleted_at IS NULL
      `, [decoded.id]);

      if (users.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found or account is inactive' 
        });
      }

      req.user = users[0];
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Middleware to check if user has required role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role_name)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role_name} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const [users] = await db.query(
      'SELECT id, first_name, last_name FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if user exists for security
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive a password reset link' 
      });
    }

    const user = users[0];
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
      [resetToken, resetExpires, user.id]
    );

    // TODO: Send password reset email
    console.log(`Password reset link: http://localhost:3000/reset-password?token=${resetToken}`);

    res.json({ 
      success: true, 
      message: 'If an account exists with this email, you will receive a password reset link' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process password reset',
      error: error.message 
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required' 
      });
    }

    // Find user by reset token
    const [users] = await db.query(
      'SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    const user = users[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await db.query(
      'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ 
      success: true, 
      message: 'Password reset successful' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password',
      error: error.message 
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user by verification token
    const [users] = await db.query(
      'SELECT id FROM users WHERE email_verification_token = ?',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token' 
      });
    }

    const user = users[0];

    // Mark email as verified
    await db.query(
      'UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE id = ?',
      [user.id]
    );

    res.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify email',
      error: error.message 
    });
  }
};

// Google OAuth (keeping existing functionality)
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  try {
    const { token, isSignUp } = req.body;
    
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    let userId;
    if (user.length === 0 && isSignUp) {
      // Create new user with default role 'user'
      const [result] = await db.query(
        'INSERT INTO users (email, name, profile_image, auth_provider, is_email_verified, primary_role) VALUES (?, ?, ?, "google", 1, "user")',
        [email, name, picture]
      );
      userId = result.insertId;
    } else if (user.length > 0) {
      // Existing user
      userId = user[0].id;
      // Update last login
      await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
    } else {
      return res.status(400).json({ error: 'User not found. Please sign up first.' });
    }

    // Generate JWT token
    const authToken = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || '***REMOVED***',
      { expiresIn: '7d' }
    );

    // Get user data
    const [userData] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    res.json({ 
      token: authToken,
      user: {
        id: userData[0].id,
        email: userData[0].email,
        name: userData[0].name,
        role: userData[0].primary_role || 'user',
        profileImage: userData[0].profile_image
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
