const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/jwtAuth');
const requireAdmin = require('../middleware/admin');
const emailService = require('../services/emailService');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || '***REMOVED***',
    { expiresIn: '7d' }
  );
};

// Input validation middleware
const validateRegisterInput = (req, res, next) => {
  const { fullName, email, password, phone, userType, adminCode } = req.body;
  
  if (!fullName || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Full name, email, and password are required' 
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters long' 
    });
  }
  
  if (userType === 'admin' && !adminCode) {
    return res.status(400).json({
      success: false,
      message: 'Admin code is required for admin registration'
    });
  }
  
  next();
};

// Input validation middleware for login
const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }
  
  next();
};

// Register a new user
router.post('/register', validateRegisterInput, async (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST START ===');
    console.log('Request body:', req.body);
    
    const { fullName, email, password, phone, userType, adminCode } = req.body;
    
    console.log('Extracted data:', { fullName, email, phone, userType, hasAdminCode: !!adminCode });
    
    // Split fullName into first_name and last_name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    console.log('Name split:', { firstName, lastName });
    
    // Check if user already exists
    const [existing] = await db.query(
      `SELECT id, first_name, last_name, email FROM users WHERE email = ? AND deleted_at IS NULL`, 
      [email]
    );
    
    if (existing.length > 0) {
      const user = existing[0];
      console.log('User already exists, returning welcome message:', user);
      
      // Return welcome message instead of error
      return res.status(200).json({ 
        success: true, 
        message: 'Welcome back!',
        existingUser: true,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          fullName: `${user.first_name} ${user.last_name}`,
          email: user.email
        },
        redirect: 'login'
      });
    }

    // Determine role based on userType and adminCode
    let roleId = 2; // Default to 'user' role
    if (userType === 'admin' && adminCode === '***REMOVED***') {
      roleId = 1; // 'admin' role
    } else if (userType === 'admin' && adminCode !== '***REMOVED***') {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin code'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = uuidv4();

    // Create user using the new schema
    console.log('About to insert user with data:', {
      email,
      firstName,
      lastName,
      phone: phone || null,
      roleId,
      verificationToken,
      hasPassword: !!hashedPassword
    });
    
    try {
      const [result] = await db.query(
        `INSERT INTO users 
         (email, password_hash, first_name, last_name, phone_number, role_id, email_verification_token, email_verified, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [email, hashedPassword, firstName, lastName, phone || null, roleId, verificationToken, false, true]
      );
      
      console.log('User inserted successfully:', {
        insertId: result.insertId,
        affectedRows: result.affectedRows
      });

      // Verify user was actually inserted into database
      if (!result.insertId || result.affectedRows !== 1) {
        console.error('Failed to insert user - no insertId or affectedRows != 1');
        return res.status(500).json({
          success: false,
          message: 'Registration failed - user not saved to database'
        });
      }

      // Double-check by querying the database
      const [verification] = await db.query(
        'SELECT id, email, first_name, last_name FROM users WHERE id = ? AND deleted_at IS NULL',
        [result.insertId]
      );

      if (!verification || verification.length === 0) {
        console.error('Database verification failed - user not found after insertion');
        return res.status(500).json({
          success: false,
          message: 'Registration failed - could not verify user in database'
        });
      }

      console.log('Database verification successful - user confirmed in database:', verification[0]);

      // Generate JWT token
      const user = {
        id: result.insertId,
        email,
        firstName,
        lastName,
        phone,
        roleId,
        emailVerified: false
      };
      
      const token = generateToken(user);

      // Send welcome email
      const userName = `${firstName} ${lastName}`;
      const welcomeResult = await emailService.sendWelcomeEmail(email, userName);
      
      if (welcomeResult.success) {
        console.log(`[Registration] Welcome email sent to ${email}`);
      } else {
        console.error(`[Registration] Failed to send welcome email:`, welcomeResult.error);
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful - user saved to database',
        databaseVerified: true,
        token,
        user: { ...user, emailVerified: user.emailVerified }
      });
    } catch (dbError) {
      console.error('Database insertion error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error during user creation',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Login user
router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const [users] = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ? AND u.deleted_at IS NULL`, 
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    const user = users[0];
    
    // Check if account is locked
    if (user.locked_until && user.locked_until > new Date()) {
      return res.status(429).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts',
        lockedUntil: user.locked_until
      });
    }
    
    // Check if account is active (optional - might not exist in database)
    // if (!user.is_active) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Account is deactivated'
    //   });
    // }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Increment login attempts
      await db.query(
        'UPDATE users SET login_attempts = login_attempts + 1, locked_until = CASE WHEN login_attempts + 1 >= 5 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE) ELSE NULL END WHERE id = ?',
        [user.id]
      );
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Check if email is verified (optional - allow login without verification for now)
    // if (!user.email_verified) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Please verify your email before logging in',
    //     requiresVerification: true
    //   });
    // }
    
    // Allow all users to login (not just admins)
    // if (user.role_name !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Admin access required'
    //   });
    // }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Reset login attempts and update last login
    await db.query(
      'UPDATE users SET last_login_at = NOW(), last_login_ip = ?, login_attempts = 0, locked_until = NULL WHERE id = ?',
      [req.ip || null, user.id]
    );
    
    // Return user data (excluding sensitive info)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: `${user.first_name} ${user.last_name}`,
      phone: user.phone_number,
      role: user.role_name,
      roleId: user.role_id,
      emailVerified: user.email_verified,
      isActive: user.is_active
    };
    
    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Get current user profile (for AuthContext)
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone_number, u.role_id, u.email_verified, u.is_active, r.name as role_name
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const user = users[0];
    
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: `${user.first_name} ${user.last_name}`,
      phone: user.phone_number,
      role: user.role_name,
      roleId: user.role_id,
      emailVerified: user.email_verified,
      isActive: user.is_active
    };
    
    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching profile' 
    });
  }
});

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone_number, u.role_id, u.email_verified, u.is_active, r.name as role_name
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const user = users[0];
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone_number,
        role: user.role_name,
        roleId: user.role_id,
        emailVerified: user.email_verified,
        isActive: user.is_active
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving profile' 
    });
  }
});

// Verify email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token is required' 
      });
    }
    
    const [users] = await db.query(
      'SELECT id FROM users WHERE email_verification_token = ? AND deleted_at IS NULL',
      [token]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token' 
      });
    }
    
    await db.query(
      'UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE email_verification_token = ?',
      [token]
    );
    
    res.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during email verification' 
    });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    const [users] = await db.query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    
    if (users.length > 0) {
      // Generate reset token and expiry
      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Save reset token to database
      await db.query(
        'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?',
        [resetToken, resetExpires, email]
      );
      
      // Send email using company email
      const userName = `${users[0].first_name} ${users[0].last_name}`;
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      
      console.log(`[Password Reset] Sending email to ${email}:`);
      console.log(`[Password Reset] Reset link: ${resetLink}`);
      
      // Send real email
      const emailResult = await emailService.sendPasswordResetEmail(email, userName, resetToken, resetLink);
      
      if (emailResult.success) {
        console.log(`[Password Reset] Email sent successfully to ${email}`);
        console.log(`[Password Reset] Message ID: ${emailResult.messageId}`);
      } else {
        console.error(`[Password Reset] Failed to send email:`, emailResult.error);
        // Still return success to frontend to prevent user enumeration
      }
    }
    
    // Always return success to prevent user enumeration
    res.json({ 
      success: true, 
      message: 'If an account exists with this email, a password reset link has been sent to your email address from thegregoryfoundationltd@gmail.com' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error processing forgot password request' 
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Check if token is valid and not expired
    const [users] = await db.query(
      'SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW() AND deleted_at IS NULL',
      [token]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update password and clear reset token
    await db.query(
      'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE password_reset_token = ?',
      [hashedPassword, token]
    );
    
    res.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error resetting password' 
    });
  }
});

// Admin-only: Get all users (for admin dashboard)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone_number, u.role_id, u.email_verified, u.is_active, u.created_at, u.last_login_at, r.name as role_name
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.deleted_at IS NULL`
    );
    
    res.json({ 
      success: true, 
      users 
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving users' 
    });
  }
});

// Test endpoint to verify database setup
router.get('/test-db-setup', async (req, res) => {
  try {
    console.log('=== TESTING DATABASE SETUP ===');
    
    // Test basic connection
    const [result] = await db.query('SELECT 1 as test');
    console.log('Database connection test:', result);
    
    // Check if users table exists
    const [tables] = await db.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'greggory_auth_platform' AND TABLE_NAME = 'users'"
    );
    console.log('Users table exists:', tables.length > 0);
    
    // Check if roles table exists and has data
    const [roles] = await db.query('SELECT * FROM roles');
    console.log('Roles in database:', roles);
    
    // Count current users
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
    console.log('Current user count:', userCount[0].count);
    
    res.json({
      success: true,
      message: 'Database setup test completed',
      data: {
        connection: result[0],
        usersTableExists: tables.length > 0,
        rolesCount: roles.length,
        userCount: userCount[0].count,
        roles: roles
      }
    });
  } catch (error) {
    console.error('Database setup test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database setup test failed',
      error: error.message
    });
  }
});

// Export the router
module.exports = router;
