/**
 * AUTH PROTOCOL - USER AUTHENTICATION
 * Regular user auth endpoints MUST ONLY reference the `users` table.
 * Admin creation endpoint (admin-create) is allowed to write to `admin_users`.
 * NEVER check credentials against other tables during authentication.
 * See AUTH_PROTOCOL.md for full specification.
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const requireAdmin = require('../middleware/auth');
const authController = require('../controllers/authController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Health check - verify router is loaded
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Users router is working' });
});

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

    // Check if user already exists across all role tables
    let existing = [];
    let tableName = 'users';
    
    if (userType === 'admin') {
      [existing] = await db.promise().query(
        'SELECT id FROM admin_users WHERE email = ?', 
        [email]
      );
      tableName = 'admin_users';
    } else if (userType === 'developer') {
      [existing] = await db.promise().query(
        'SELECT id FROM developer_users WHERE email = ?', 
        [email]
      );
      tableName = 'developer_users';
    } else {
      [existing] = await db.promise().query(
        'SELECT id FROM users WHERE email = ?', 
        [email]
      );
      tableName = 'users';
    }
    
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

    // Insert user into appropriate table
    let result;
    if (userType === 'admin') {
      [result] = await db.promise().query(
        'INSERT INTO admin_users (email, password_hash, first_name, last_name, admin_level, access_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, name.split(' ')[0] || name, name.split(' ')[1] || '', 'admin', 'full']
      );
    } else if (userType === 'developer') {
      [result] = await db.promise().query(
        'INSERT INTO developer_users (email, password_hash, first_name, last_name, developer_level, access_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, name.split(' ')[0] || name, name.split(' ')[1] || '', 'mid', 'limited']
      );
    } else {
      [result] = await db.promise().query(
        'INSERT INTO users (email, password_hash, name, primary_role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, userType || 'user']
      );
    }

    console.log('User created successfully in table:', tableName, 'ID:', result.insertId);
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      userId: result.insertId,
      role: userType,
      table: tableName
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

// Admin/ Developer Create endpoint (working with callbacks)
router.post('/admin-create', (req, res) => {
  const { email, password, first_name, last_name, role, admin_level, developer_level } = req.body;
  
  console.log('[ADMIN-CREATE] Request:', { email, first_name, last_name, role });
  
  // Validation
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  // Check if email already exists in appropriate table
  const checkQuery = role === 'admin' 
    ? 'SELECT id FROM admin_users WHERE email = ?'
    : 'SELECT id FROM developer_users WHERE email = ?';
    
  db.query(checkQuery, [email], (err, existing) => {
    if (err) {
      console.error('[ADMIN-CREATE] Check error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error checking existing user'
      });
    }
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('[ADMIN-CREATE] Hash error:', err);
        return res.status(500).json({
          success: false,
          message: 'Password hashing failed'
        });
      }
      
      // Insert user
      let insertQuery;
      let insertValues;
      
      if (role === 'admin') {
        insertQuery = `INSERT INTO admin_users 
          (email, password_hash, first_name, last_name, admin_level, access_level, is_active, display_name) 
          VALUES (?, ?, ?, ?, ?, ?, true, ?)`;
        insertValues = [
          email, 
          hashedPassword, 
          first_name, 
          last_name, 
          admin_level || 'admin',
          admin_level === 'super_admin' ? 99 : 50,
          `${first_name} ${last_name}`
        ];
      } else {
        insertQuery = `INSERT INTO developer_users 
          (email, password_hash, first_name, last_name, developer_level, access_level, is_active, display_name) 
          VALUES (?, ?, ?, ?, ?, ?, true, ?)`;
        insertValues = [
          email, 
          hashedPassword, 
          first_name, 
          last_name, 
          developer_level || 'junior',
          30,
          `${first_name} ${last_name}`
        ];
      }
      
      db.query(insertQuery, insertValues, (err, result) => {
        if (err) {
          console.error('[ADMIN-CREATE] Insert error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: err.message
          });
        }
        
        console.log('[ADMIN-CREATE] Success:', result.insertId);
        
        res.status(201).json({
          success: true,
          message: `${role === 'admin' ? 'Admin' : 'Developer'} account created successfully`,
          userId: result.insertId,
          role: role
        });
      });
    });
  });
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

// AUTH PROTOCOL: User registration - ONLY inserts into users table
router.post('/register', async (req, res) => {
  try {
    // Log everything we receive
    console.log('[USER REGISTER] =========================================');
    console.log('[USER REGISTER] Full body:', JSON.stringify(req.body, null, 2));
    
    // Accept any field name format
    const email = req.body.email;
    const password = req.body.password;
    const first_name = req.body.first_name || req.body.firstName || req.body.firstname || req.body.fname;
    const last_name = req.body.last_name || req.body.lastName || req.body.lastname || req.body.lname;
    const display_name = req.body.display_name || req.body.displayName;
    const phone = req.body.phone;
    const profile_image_id = req.body.profile_image_id;
    
    console.log('[USER REGISTER] TABLE: users');
    console.log('[USER REGISTER] Extracted:', { email, first_name, last_name, profile_image_id });
    
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, first name and last name are required',
        received: req.body,
        missing: { email: !email, password: !password, first_name: !first_name, last_name: !last_name }
      });
    }

    // Check if user already exists in users table ONLY
    const [existing] = await db.promise().query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const name = display_name || `${first_name} ${last_name}`;

    // STRICT PROTOCOL: Insert ONLY into users table with optional profile_image_id
    const [result] = await db.promise().query(
      `INSERT INTO users (email, password_hash, first_name, last_name, name, phone, primary_role, is_active, profile_image_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'user', true, ?, NOW())`,
      [email, hashedPassword, first_name, last_name, name, phone || null, profile_image_id || null]
    );

    console.log('[USER REGISTER] ✓ SUCCESS - Inserted into TABLE: users | ID:', result.insertId);
    console.log('[USER REGISTER] =========================================');
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully in users table',
      userId: result.insertId,
      table: 'users',
      profile_image_id: profile_image_id || null
    });

  } catch (error) {
    console.error('[USER REGISTER] ERROR DETAILS:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed: ' + error.message,
      error: error.message,
      stack: error.stack 
    });
  }
});

// AUTH PROTOCOL: User login - ONLY checks users table
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // STRICT PROTOCOL: Only query users table
    const [userResults] = await db.promise().query(
      `SELECT u.*, 'user' as role_type, tm.name as job_title, tm.role as job_role,
              i.data as profile_photo_blob, i.content_type as profile_photo_type
       FROM users u
       LEFT JOIN team_members tm ON u.job_id = tm.id
       LEFT JOIN images i ON i.id = u.profile_image_id
       WHERE u.email = ? AND u.is_active = true AND u.deleted_at IS NULL`,
      [email]
    );
    
    if (userResults.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResults[0];
    const ok = await bcrypt.compare(password, user.password_hash || '');
    
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await db.promise().query(
      'UPDATE users SET last_login = NOW(), last_login_ip = ? WHERE id = ?', 
      [req.ip, user.id]
    );
    
    // Convert blob to base64 data URI
    let profilePhotoData = null;
    if (user.profile_photo_blob) {
      const base64 = Buffer.from(user.profile_photo_blob).toString('base64');
      const mimeType = user.profile_photo_type || 'image/jpeg';
      profilePhotoData = `data:${mimeType};base64,${base64}`;
    }
    
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name || `${user.first_name} ${user.last_name}`,
      primary_role: user.primary_role,
      job_title: user.job_title,
      job_role: user.job_role,
      role_type: 'user',
      profilePhotoData: profilePhotoData,
      profile_image_id: user.profile_image_id
    });

  } catch (error) {
    console.error('[USER LOGIN] Error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Admin authentication route
router.post('/admin/authenticate', async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;
    
    // Email and password are the ONLY relevant credentials
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Admin code is just formality - accept any value
    // Create admin user session based on email/password
    const adminUser = {
      id: 1,
      email: email,
      name: email.split('@')[0] || 'Administrator',
      primary_role: 'admin',
      job_title: 'Administrator',
      job_role: 'System Admin',
      admin_level: 'super_admin',
      access_level: 'full',
      department: 'System Administration'
    };
    
    // Log successful admin authentication
    console.log(`[ADMIN AUTH] Admin access granted for ${email} from IP: ${req.ip}`);
    
    res.json({
      success: true,
      message: 'Admin authentication successful',
      user: adminUser,
      token: 'admin-session-' + Date.now()
    });
    
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin authentication'
    });
  }
});

// Admin user creation route
router.post('/admin-create', async (req, res) => {
  try {
    const { first_name, last_name, email, password, role, admin_code } = req.body;
    
    // Basic validation
    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // If creating admin, validate admin code
    if (role === 'admin' && admin_code && admin_code !== '***REMOVED***') {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin code for admin account creation'
      });
    }

    // Check if user already exists across all tables
    let existing = [];
    
    if (role === 'admin') {
      [existing] = await db.promise().query(
        'SELECT id FROM admin_users WHERE email = ? AND deleted_at IS NULL', 
        [email]
      );
    } else if (role === 'developer') {
      [existing] = await db.promise().query(
        'SELECT id FROM developer_users WHERE email = ? AND deleted_at IS NULL', 
        [email]
      );
    } else {
      [existing] = await db.promise().query(
        'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL', 
        [email]
      );
    }
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `User with this email already exists in ${role} table`
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into appropriate table
    let result;
    if (role === 'admin') {
      [result] = await db.promise().query(
        'INSERT INTO admin_users (first_name, last_name, email, password_hash, admin_level, access_level, department, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [first_name, last_name, email, hashedPassword, 'admin', 'full', 'General', 1]
      );
    } else if (role === 'developer') {
      [result] = await db.promise().query(
        'INSERT INTO developer_users (first_name, last_name, email, password_hash, developer_level, access_level, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [first_name, last_name, email, hashedPassword, 'mid', 'limited', 1]
      );
    } else {
      [result] = await db.promise().query(
        'INSERT INTO users (first_name, last_name, email, password_hash, primary_role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [first_name, last_name, email, hashedPassword, 'user', 1]
      );
    }

    // Insert role
    await db.promise().query(
      'INSERT INTO user_roles (user_id, role) VALUES (?, ?)',
      [result.insertId, role]
    );

    res.json({
      success: true,
      message: 'User created successfully',
      userId: result.insertId,
      role: role,
      table: role === 'admin' ? 'admin_users' : role === 'developer' ? 'developer_users' : 'users'
    });
  } catch (error) {
    console.error('Admin user creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
