const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

function getAdminSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.JWT_SECRET ||
    'dev-only-set-ADMIN_SESSION_SECRET-in-production'
  );
}

function signAdminSessionToken(userId) {
  const payload = {
    uid: Number(userId),
    exp: Date.now() + 8 * 60 * 60 * 1000
  };
  const secret = getAdminSessionSecret();
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyAdminSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!body || !sig) return null;
  const secret = getAdminSessionSecret();
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) return null;
  try {
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload.uid || !payload.exp || Date.now() > payload.exp) return null;
  return payload;
}

// In-memory fallback for Redis (development)
const memoryStore = new Map();

// Security Helper Functions
const trackFailedLogin = async (email, ip) => {
  const attemptsKey = `admin_failed_attempts_${email}`;
  const lockoutKey = `admin_account_locked_${email}`;
  const rateLimitKey = `admin_login_attempts_${ip}`;
  
  try {
    // Try Redis first, fallback to memory
    let failedAttempts;
    if (redis) {
      failedAttempts = await redis.incr(attemptsKey) || 1;
      await redis.expire(attemptsKey, 3600); // 1 hour expiry
      await redis.incr(rateLimitKey);
      await redis.expire(rateLimitKey, 900); // 15 minutes expiry
      
      if (failedAttempts >= 5) {
        await redis.set(lockoutKey, 'true', 'EX', 1800); // 30 minutes lockout
      }
    } else {
      // Memory fallback
      const now = Date.now();
      const current = memoryStore.get(attemptsKey) || { count: 0, expires: 0 };
      failedAttempts = current.expires > now ? current.count + 1 : 1;
      memoryStore.set(attemptsKey, { count: failedAttempts, expires: now + 3600000 });
      
      const rateLimit = memoryStore.get(rateLimitKey) || { count: 0, expires: 0 };
      const newRateCount = rateLimit.expires > now ? rateLimit.count + 1 : 1;
      memoryStore.set(rateLimitKey, { count: newRateCount, expires: now + 900000 });
      
      if (failedAttempts >= 5) {
        memoryStore.set(lockoutKey, { locked: true, expires: now + 1800000 });
      }
    }
    
    if (failedAttempts >= 5) {
      console.log(`[SECURITY] Account locked for 30 minutes: ${email} from IP: ${ip}`);
    }
  } catch (error) {
    console.error('Security tracking error:', error);
  }
};

const clearFailedAttempts = async (email, ip) => {
  try {
    if (redis) {
      await redis.del(`admin_failed_attempts_${email}`);
      await redis.del(`admin_account_locked_${email}`);
      await redis.del(`admin_login_attempts_${ip}`);
    } else {
      // Memory fallback
      memoryStore.delete(`admin_failed_attempts_${email}`);
      memoryStore.delete(`admin_account_locked_${email}`);
      memoryStore.delete(`admin_login_attempts_${ip}`);
    }
  } catch (error) {
    console.error('Error clearing failed attempts:', error);
  }
};

/** Client IP string for admin routes (first hop if X-Forwarded-For is set). */
function getClientIpForAdmin(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) {
    return String(fwd).split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '';
}

/** True when the request clearly comes from this machine (loopback). */
function isLocalAdminIp(raw) {
  if (!raw || typeof raw !== 'string') return false;
  const ip = raw.replace(/^::ffff:/i, '').trim().toLowerCase();
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip === '0:0:0:0:0:0:0:1' ||
    ip === '::ffff:127.0.0.1'
  );
}

// PDF Generation Helper Function
function generatePDFContent(type, document) {
  // Simple PDF content generation (in production, use a proper PDF library like puppeteer or pdfkit)
  let content = '';
  
  if (type === 'invoices') {
    content = `
INVOICE

Invoice Number: ${document.invoice_number}
Date: ${document.issue_date}
Due Date: ${document.due_date}

Bill To:
${document.client_name}
${document.client_company || ''}
${document.client_address || ''}
${document.client_email || ''}
${document.client_phone || ''}

Description:
${document.description || ''}

Amount: KES ${document.total_amount_kes || document.total_amount}
Status: ${document.payment_status}

Payment Method: ${document.payment_method}
Payment Phone: ${document.payment_phone}

Notes: ${document.notes || ''}
    `;
  } else if (type === 'quotes') {
    content = `
QUOTE

Quote Number: ${document.quote_number}
Date: ${document.issue_date}
Valid Until: ${document.valid_until}

Quote To:
${document.client_name}
${document.client_company || ''}
${document.client_address || ''}
${document.client_email || ''}
${document.client_phone || ''}

Description:
${document.description || ''}

Amount: KES ${document.total_amount_kes || document.total_amount}
Status: ${document.status}

Priority: ${document.priority}
Type: ${document.quote_type}

Payment Terms: ${document.payment_terms || ''}
Delivery Timeline: ${document.delivery_timeline || ''}

Notes: ${document.notes || ''}
    `;
  } else if (type === 'transactions' || type === 'receipt') {
    content = `
PAYMENT RECEIPT

Transaction ID: ${document.transaction_id}
Date: ${document.transaction_date}
Amount: KES ${document.amount}
Status: ${document.status}

Payment Details:
Method: ${document.payment_method}
Phone: ${document.phone_number}
Business Number: ${document.business_number}
Account Reference: ${document.account_reference}

Client: ${document.client_name}
Email: ${document.client_email}
Phone: ${document.client_phone}

Notes: ${document.notes || ''}
    `;
  }
  
  // Return as Buffer (in production, generate actual PDF)
  return Buffer.from(content, 'utf-8');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - allow frontend to access API
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));

// Multer configuration for profile photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Create a connection pool for the main database
const mainDb = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'greggory_foundation_db_main',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test main database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await mainDb.query('SELECT 1 as test');
    res.json({ success: true, message: 'Database connection successful', data: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// List all databases
app.get('/api/databases', async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      `SELECT schema_name as name 
       FROM information_schema.schemata 
       WHERE schema_name NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys', 'phpmyadmin')`
    );
    res.json({ success: true, databases: rows });
  } catch (error) {
    console.error('Error fetching databases:', error);
    res.status(500).json({ success: false, message: 'Error fetching databases', error: error.message });
  }
});

// Dynamic database connection middleware
app.use('/api/db/:database', async (req, res, next) => {
  const { database } = req.params;
  
  // Skip if it's the databases endpoint
  if (req.path.includes('/databases')) return next();
  
  try {
    // Create a new connection for the requested database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: database
    });
    
    // Attach the connection to the request
    req.db = connection;
    
    // Close the connection when response is sent
    res.on('finish', () => {
      connection.end().catch(console.error);
    });
    
    next();
  } catch (error) {
    console.error(`Error connecting to database ${database}:`, error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to connect to database: ${database}`,
      error: error.message 
    });
  }
});

// Get tables from a specific database
app.get('/api/db/:database/tables', async (req, res) => {
  try {
    const [tables] = await req.db.query('SHOW TABLES');
    res.json({ success: true, tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ success: false, message: 'Error fetching tables', error: error.message });
  }
});

// Get table data
app.get('/api/db/:database/table/:table', async (req, res) => {
  const { database, table } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  
  try {
    // Get table structure
    const [columns] = await req.db.query(`DESCRIBE ${table}`);
    
    // Get table data with pagination
    const [rows] = await req.db.query(
      `SELECT * FROM ${table} LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    
    // Get total count for pagination
    const [[{ total }]] = await req.db.query(
      `SELECT COUNT(*) as total FROM ${table}`
    );
    
    res.json({
      success: true,
      database,
      table,
      columns,
      data: rows,
      pagination: {
        total: parseInt(total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error(`Error fetching data from ${database}.${table}:`, error);
    res.status(500).json({
      success: false,
      message: `Error fetching data from ${table}`,
      error: error.message
    });
  }
});

// ========== WEBSITE API ENDPOINTS ==========

// Users API
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await mainDb.query(
      'SELECT id, email, first_name, last_name, display_name, role, created_at FROM users WHERE deleted_at IS NULL'
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, password, first_name, last_name, display_name, role = 'user' } = req.body;
    
    const [result] = await mainDb.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, display_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password, first_name, last_name, display_name, role]
    );
    
    res.json({ success: true, userId: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
  }
});

// Login endpoint - Regular Users
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const [users] = await mainDb.query(
      'SELECT id, email, first_name, last_name, display_name, password_hash, profile_photo_blob IS NOT NULL AS has_photo FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify password using bcrypt
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: user.display_name,
        has_photo: user.has_photo,
        profile_photo_url: user.has_photo ? `/api/users/profile-photo/${user.id}` : null,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// Registration endpoint - accepts JSON with optional profile photo
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, display_name, phone, profile_photo_base64, profile_photo_mime_type, profile_photo_file_name, profile_image_id, userRole } = req.body;
    
    console.log('[USER REGISTER] Request received:', { email, first_name, last_name, userRole });

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      console.log('[USER REGISTER] Validation failed:', { email: !!email, password: !!password, first_name: !!first_name, last_name: !!last_name });
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
    }

    // Check database connection
    if (!mainDb) {
      console.error('[USER REGISTER] Database connection not available');
      return res.status(500).json({ success: false, message: 'Database connection not available' });
    }

    // Check if user already exists
    console.log('[USER REGISTER] Checking if user exists:', email);
    const [existingUsers] = await mainDb.query(
      'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Set default display_name if not provided
    const finalDisplayName = display_name || `${first_name} ${last_name}`;

    // Handle profile photo - either from base64 direct upload or from images table
    let profilePhotoBlob = null;
    let photoMimeType = profile_photo_mime_type || null;
    let photoFileName = profile_photo_file_name || null;
    
    if (profile_photo_base64) {
      // Direct base64 upload
      try {
        const base64Data = profile_photo_base64.replace(/^data:image\/\w+;base64,/, '');
        profilePhotoBlob = Buffer.from(base64Data, 'base64');
        console.log(`[USER REGISTER] Profile photo from base64: ${profilePhotoBlob.length} bytes`);
      } catch (e) {
        console.error('[USER REGISTER] Failed to decode base64 photo:', e.message);
      }
    } else if (profile_image_id) {
      // Fetch from images table (frontend uploaded to /api/images/profile first)
      try {
        const [images] = await mainDb.query(
          'SELECT data, content_type, file_name FROM images WHERE id = ?',
          [profile_image_id]
        );
        if (images.length > 0) {
          profilePhotoBlob = images[0].data;
          photoMimeType = images[0].content_type;
          photoFileName = images[0].file_name;
          console.log(`[USER REGISTER] Profile photo from images table: ${profilePhotoBlob.length} bytes (ID: ${profile_image_id})`);
        }
      } catch (e) {
        console.error('[USER REGISTER] Failed to fetch image from table:', e.message);
      }
    }

    // Create new user with profile photo BLOB if provided
    const [result] = await mainDb.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, display_name, profile_photo_blob, profile_photo_mime_type, profile_photo_file_name, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)',
      [email, hashedPassword, first_name, last_name, display_name || `${first_name} ${last_name}`, profilePhotoBlob, photoMimeType, photoFileName]
    );
    
    const userId = result.insertId;
    console.log('[USER REGISTER] Registration successful:', userId);
    
    // Assign role to user
    let roleId = 2; // Default to user role
    if (userRole === 'admin') {
      roleId = 1;
    } else if (userRole === 'developer') {
      roleId = 3;
    }
    
    await mainDb.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, roleId]
    );
    
    console.log('[USER REGISTER] Role assigned:', { userId, roleId, role: userRole });
    
    res.json({ 
      success: true, 
      userId: userId,
      message: 'User registered successfully',
      role: userRole || 'user',
      roleId: roleId,
      has_photo: !!profilePhotoBlob
    });
  } catch (error) {
    console.error('[USER REGISTER] Error:', error);
    console.error('[USER REGISTER] Error code:', error.code);
    console.error('[USER REGISTER] Error SQL:', error.sql);
    console.error('[USER REGISTER] Error stack:', error.stack);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed: ' + error.message, 
      error: error.message, 
      errorCode: error.code,
      sql: error.sql 
    });
  }
});

// Google Auth endpoint
app.post('/api/users/google-auth', async (req, res) => {
  try {
    const { email, first_name, last_name, display_name, google_id, profile_photo_url } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Check if user already exists
    const [existingUsers] = await mainDb.query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    
    if (existingUsers.length > 0) {
      // User exists - return their data
      const user = existingUsers[0];
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: 'user'
        },
        message: 'Login successful'
      });
    }
    
    // Create new user from Google data
    const [result] = await mainDb.query(
      'INSERT INTO users (email, first_name, last_name, display_name, google_id, email_verified, is_active) VALUES (?, ?, ?, ?, ?, TRUE, TRUE)',
      [email, first_name || '', last_name || '', display_name || `${first_name} ${last_name}`, google_id || null]
    );
    
    const userId = result.insertId;
    
    // Assign default user role
    await mainDb.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, 2] // 2 = user role
    );
    
    res.json({
      success: true,
      user: {
        id: userId,
        email,
        first_name,
        last_name,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('[USER REGISTER] Error:', error);
    res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
});

// Admin create user endpoint
app.post('/api/users/admin-create', async (req, res) => {
  try {
    const { first_name, last_name, email, password, role = 'user', admin_level = 'admin', developer_level = 'mid' } = req.body;
    
    console.log(`[ADMIN CREATE] Received registration request:`, { first_name, last_name, email, role, admin_level, developer_level });
    
    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);
    
    let result;
    let userId;
    let tableUsed;
    
    // Create user in appropriate table based on role
    if (role === 'admin') {
      tableUsed = 'admin_users';
      // Check if email already exists in admin_users
      const [existing] = await mainDb.query(
        'SELECT id FROM admin_users WHERE email = ?',
        [email]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Admin user with this email already exists'
        });
      }
      
      // Insert into admin_users table
      [result] = await mainDb.query(
        `INSERT INTO admin_users (
          email, password_hash, first_name, last_name, 
          admin_level, access_level, is_active, email_verified
        ) VALUES (?, ?, ?, ?, ?, 'full', TRUE, TRUE)`,
        [email, hashedPassword, first_name, last_name, admin_level]
      );
      userId = result.insertId;
      
      console.log(`[ADMIN CREATE] Admin user created: ${email}, ID: ${userId}, Level: ${admin_level}, Table: ${tableUsed}`);
      
    } else if (role === 'developer') {
      tableUsed = 'developer_users';
      // Check if email already exists in developer_users
      const [existing] = await mainDb.query(
        'SELECT id FROM developer_users WHERE email = ?',
        [email]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Developer user with this email already exists'
        });
      }
      
      // Insert into developer_users table
      [result] = await mainDb.query(
        `INSERT INTO developer_users (
          email, password_hash, first_name, last_name,
          developer_level, is_active, email_verified
        ) VALUES (?, ?, ?, ?, ?, TRUE, TRUE)`,
        [email, hashedPassword, first_name, last_name, developer_level]
      );
      userId = result.insertId;
      
      console.log(`[ADMIN CREATE] Developer user created: ${email}, ID: ${userId}, Level: ${developer_level}, Table: ${tableUsed}`);
      
    } else {
      tableUsed = 'users';
      // Regular user - insert into users table with role
      // Check if email already exists
      const [existing] = await mainDb.query(
        'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
        [email]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      
      // Insert into users table
      [result] = await mainDb.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, first_name, last_name, role]
      );
      userId = result.insertId;
      
      // If role is not 'user', add to user_roles junction table
      if (role !== 'user') {
        const [roleRows] = await mainDb.query(
          'SELECT id FROM roles WHERE name = ?',
          [role]
        );
        if (roleRows.length > 0) {
          await mainDb.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, roleRows[0].id]
          );
        }
      }
      
      console.log(`[ADMIN CREATE] Regular user created: ${email}, ID: ${userId}, Role: ${role}, Table: ${tableUsed}`);
    }
    
    console.log(`[ADMIN CREATE] Response: success=true, userId=${userId}, role=${role}, table=${tableUsed}`);
    
    res.json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully`,
      userId: userId,
      role: role,
      table: tableUsed
    });
    
  } catch (error) {
    console.error('[ADMIN CREATE] Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// User Projects API
app.get('/api/users/projects', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // For now, return mock data - replace with actual database query
    // This would typically query a projects table filtered by user_id
    const mockProjects = [
      {
        id: 1,
        name: 'Community Center Renovation',
        description: 'Renovation of the main community center with updated facilities',
        status: 'active',
        progress: 65,
        startDate: '2024-01-15',
        expectedCompletion: '2024-06-30',
        budget: 150000,
        spent: 97500,
        team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
        activities: [
          { type: 'update', message: 'Foundation work completed', date: '2024-03-15', user: 'John Doe' },
          { type: 'milestone', message: '65% completion reached', date: '2024-03-20', user: 'Jane Smith' },
          { type: 'alert', message: 'Budget adjustment needed', date: '2024-03-22', user: 'Mike Johnson' }
        ]
      },
      {
        id: 2,
        name: 'Youth Sports Program',
        description: 'Development of comprehensive youth sports facilities and programs',
        status: 'active',
        progress: 40,
        startDate: '2024-02-01',
        expectedCompletion: '2024-08-15',
        budget: 85000,
        spent: 34000,
        team: ['Sarah Wilson', 'Tom Brown'],
        activities: [
          { type: 'update', message: 'Equipment procurement started', date: '2024-03-10', user: 'Sarah Wilson' },
          { type: 'milestone', message: '40% completion achieved', date: '2024-03-18', user: 'Tom Brown' }
        ]
      },
      {
        id: 3,
        name: 'Educational Scholarship Fund',
        description: 'Scholarship program for underprivileged students',
        status: 'completed',
        progress: 100,
        startDate: '2023-09-01',
        expectedCompletion: '2024-01-31',
        budget: 50000,
        spent: 48500,
        team: ['Emily Davis', 'Robert Lee'],
        activities: [
          { type: 'update', message: 'Final scholarship awards distributed', date: '2024-01-25', user: 'Emily Davis' },
          { type: 'milestone', message: 'Project completed successfully', date: '2024-01-31', user: 'Robert Lee' }
        ]
      }
    ];

    res.json({
      success: true,
      projects: mockProjects,
      message: 'Projects retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch projects', 
      error: error.message 
    });
  }
});

// Project Photos API
app.get('/api/projects/:id/photos', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const query = `
      SELECT id, photo_type, title, description, file_name, file_type, file_size, 
             is_featured, display_order, created_at, photo_data
      FROM project_photos
      WHERE project_id = ?
      ORDER BY is_featured DESC, display_order ASC, created_at DESC
    `;
    
    const [photos] = await db.execute(query, [projectId]);
    
    res.json({
      success: true,
      photos: photos.map(photo => ({
        id: photo.id,
        type: photo.photo_type,
        title: photo.title,
        description: photo.description,
        fileName: photo.file_name,
        fileType: photo.file_type,
        fileSize: photo.file_size,
        isFeatured: photo.is_featured,
        displayOrder: photo.display_order,
        createdAt: photo.created_at,
        // Include data URL for frontend display
        dataUrl: `data:${photo.file_type};base64,${Buffer.from(photo.photo_data || '').toString('base64')}`
      }))
    });
  } catch (error) {
    console.error('Error fetching project photos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project photos',
      error: error.message
    });
  }
});

app.post('/api/projects/:id/photos', upload.single('photo'), async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title, description, photo_type = 'progress' } = req.body;
    const userId = req.user?.id || 1; // Default to user 1 for demo
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided'
      });
    }
    
    // Read file data
    const fs = require('fs');
    const photoData = fs.readFileSync(req.file.path);
    
    // Insert project photo record with BLOB data
    const photoQuery = `
      INSERT INTO project_photos (project_id, photo_data, file_name, file_type, file_size, photo_type, title, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [photoResult] = await db.execute(photoQuery, [
      projectId,
      photoData,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      photo_type,
      title,
      description,
      userId
    ]);
    
    const photoId = photoResult.insertId;
    
    // Clean up temporary file
    fs.unlinkSync(req.file.path);
    
    // Create data URL for immediate response
    const dataUrl = `data:${req.file.mimetype};base64,${Buffer.from(photoData).toString('base64')}`;
    
    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: {
        id: photoId,
        title: title,
        type: photo_type,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        dataUrl: dataUrl
      }
    });
  } catch (error) {
    console.error('Error uploading project photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo',
      error: error.message
    });
  }
});

app.delete('/api/projects/:id/photos/:photoId', async (req, res) => {
  try {
    const { id: projectId, photoId } = req.params;
    
    // Check if photo exists and belongs to project
    const photoQuery = `
      SELECT id, project_id, file_name
      FROM project_photos
      WHERE id = ? AND project_id = ?
    `;
    
    const [photos] = await db.execute(photoQuery, [photoId, projectId]);
    
    if (photos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }
    
    // Delete project photo record (BLOB data will be deleted automatically)
    await db.execute('DELETE FROM project_photos WHERE id = ?', [photoId]);
    
    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo',
      error: error.message
    });
  }
});

// Accounting Management APIs
app.get('/api/accounting/entries', async (req, res) => {
  try {
    const { project_id, entry_type, category, payment_status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT ae.*, p.name as project_name, u.first_name, u.last_name
      FROM accounting_entries ae
      LEFT JOIN projects p ON ae.project_id = p.id
      LEFT JOIN users u ON ae.created_by = u.id
      WHERE ae.deleted_at IS NULL
    `;
    const params = [];
    
    if (project_id) {
      query += ' AND ae.project_id = ?';
      params.push(project_id);
    }
    
    if (entry_type) {
      query += ' AND ae.entry_type = ?';
      params.push(entry_type);
    }
    
    if (category) {
      query += ' AND ae.category = ?';
      params.push(category);
    }
    
    if (payment_status) {
      query += ' AND ae.payment_status = ?';
      params.push(payment_status);
    }
    
    query += ' ORDER BY ae.transaction_date DESC, ae.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [entries] = await db.execute(query, params);
    
    res.json({
      success: true,
      entries: entries.map(entry => ({
        ...entry,
        created_by_name: `${entry.first_name} ${entry.last_name}`.trim()
      }))
    });
  } catch (error) {
    console.error('Error fetching accounting entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounting entries',
      error: error.message
    });
  }
});

app.post('/api/accounting/entries', async (req, res) => {
  try {
    const {
      entry_type,
      category,
      subcategory,
      amount,
      tax_amount,
      currency,
      exchange_rate,
      transaction_date,
      transaction_reference,
      payment_method,
      payment_status,
      description,
      notes,
      budget_category,
      budget_period,
      is_billable,
      billable_percentage,
      tax_rate,
      tax_exempt,
      tax_region,
      project_id,
      invoice_id,
      receipt_id,
      contract_id
    } = req.body;
    
    const userId = req.user?.id || 1; // Default to user 1 for demo
    
    const query = `
      INSERT INTO accounting_entries (
        entry_type, category, subcategory, amount, tax_amount, currency, exchange_rate,
        transaction_date, transaction_reference, payment_method, payment_status,
        description, notes, budget_category, budget_period, is_billable, billable_percentage,
        tax_rate, tax_exempt, tax_region, project_id, invoice_id, receipt_id, contract_id,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      entry_type,
      category,
      subcategory,
      parseFloat(amount),
      parseFloat(tax_amount || 0),
      currency,
      parseFloat(exchange_rate || 1),
      transaction_date,
      transaction_reference,
      payment_method,
      payment_status,
      description,
      notes,
      budget_category,
      budget_period,
      is_billable,
      parseFloat(billable_percentage || 100),
      parseFloat(tax_rate || 0),
      tax_exempt,
      tax_region,
      project_id,
      invoice_id,
      receipt_id,
      contract_id,
      userId
    ]);
    
    res.json({
      success: true,
      message: 'Accounting entry created successfully',
      entryId: result.insertId
    });
  } catch (error) {
    console.error('Error creating accounting entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create accounting entry',
      error: error.message
    });
  }
});

app.delete('/api/accounting/entries/:id', async (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user?.id || 1;
    
    // Soft delete the entry
    await db.execute(
      'UPDATE accounting_entries SET deleted_at = NOW(), deleted_by = ? WHERE id = ?',
      [userId, entryId]
    );
    
    res.json({
      success: true,
      message: 'Accounting entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting accounting entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete accounting entry',
      error: error.message
    });
  }
});

app.get('/api/accounting/categories', async (req, res) => {
  try {
    const [categories] = await db.execute(
      'SELECT * FROM accounting_categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC'
    );
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching accounting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounting categories',
      error: error.message
    });
  }
});

app.get('/api/accounting/periods', async (req, res) => {
  try {
    const { project_id } = req.query;
    
    let query = `
      SELECT ap.*, p.name as project_name
      FROM accounting_periods ap
      LEFT JOIN projects p ON ap.project_id = p.id
      WHERE 1=1
    `;
    const params = [];
    
    if (project_id) {
      query += ' AND ap.project_id = ?';
      params.push(project_id);
    }
    
    query += ' ORDER BY ap.start_date DESC';
    
    const [periods] = await db.execute(query, params);
    
    res.json({
      success: true,
      periods
    });
  } catch (error) {
    console.error('Error fetching accounting periods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounting periods',
      error: error.message
    });
  }
});

app.get('/api/financial/reports', async (req, res) => {
  try {
    const { project_id, report_type, limit = 20 } = req.query;
    
    let query = `
      SELECT fr.*, p.name as project_name, u.first_name, u.last_name
      FROM financial_reports fr
      LEFT JOIN projects p ON fr.project_id = p.id
      LEFT JOIN users u ON fr.generated_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (project_id) {
      query += ' AND fr.project_id = ?';
      params.push(project_id);
    }
    
    if (report_type) {
      query += ' AND fr.report_type = ?';
      params.push(report_type);
    }
    
    query += ' ORDER BY fr.generated_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [reports] = await db.execute(query, params);
    
    res.json({
      success: true,
      reports: reports.map(report => ({
        ...report,
        generated_by_name: `${report.first_name} ${report.last_name}`.trim()
      }))
    });
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch financial reports',
      error: error.message
    });
  }
});

// Invoice Management APIs
app.get('/api/invoices', async (req, res) => {
  try {
    const { project_id, status, payment_status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT i.*, p.name as project_name, u.first_name, u.last_name,
             CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM invoices i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.deleted_at IS NULL
    `;
    const params = [];
    
    if (project_id) {
      query += ' AND i.project_id = ?';
      params.push(project_id);
    }
    
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    
    if (payment_status) {
      query += ' AND i.payment_status = ?';
      params.push(payment_status);
    }
    
    query += ' ORDER BY i.issue_date DESC, i.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [invoices] = await db.execute(query, params);
    
    res.json({
      success: true,
      invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const {
      project_id,
      invoice_type,
      title,
      description,
      subtotal,
      tax_rate,
      currency,
      exchange_rate,
      issue_date,
      due_date,
      payment_method,
      payment_phone,
      client_name,
      client_email,
      client_phone,
      client_address,
      items,
      notes,
      payment_terms,
      terms_conditions
    } = req.body;
    
    const userId = req.user?.id || 1;
    
    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const query = `
      INSERT INTO invoices (
        project_id, invoice_number, invoice_type, title, description,
        subtotal, tax_rate, currency, exchange_rate, issue_date, due_date,
        payment_method, payment_phone, client_name, client_email, client_phone,
        client_address, items, notes, payment_terms, terms_conditions, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      project_id,
      invoiceNumber,
      invoice_type,
      title,
      description,
      parseFloat(subtotal),
      parseFloat(tax_rate || 0),
      currency,
      parseFloat(exchange_rate || 1),
      issue_date,
      due_date,
      payment_method,
      payment_phone,
      client_name,
      client_email,
      client_phone,
      client_address,
      JSON.stringify(items || []),
      notes,
      payment_terms,
      terms_conditions,
      userId
    ]);
    
    res.json({
      success: true,
      message: 'Invoice created successfully',
      invoiceId: result.insertId,
      invoiceNumber: invoiceNumber
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const userId = req.user?.id || 1;
    
    const {
      status,
      payment_status,
      notes,
      admin_response
    } = req.body;
    
    const query = `
      UPDATE invoices 
      SET status = ?, payment_status = ?, notes = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.execute(query, [status, payment_status, notes, userId, invoiceId]);
    
    res.json({
      success: true,
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message
    });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const userId = req.user?.id || 1;
    
    // Soft delete the invoice
    await db.execute(
      'UPDATE invoices SET deleted_at = NOW(), deleted_by = ? WHERE id = ?',
      [userId, invoiceId]
    );
    
    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
});

// M-Pesa Payment APIs
app.get('/api/mpesa/transactions', async (req, res) => {
  try {
    const { invoice_id, project_id, status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT mt.*, i.invoice_number, p.name as project_name,
             CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM mpesa_transactions mt
      LEFT JOIN invoices i ON mt.invoice_id = i.id
      LEFT JOIN projects p ON mt.project_id = p.id
      LEFT JOIN users u ON mt.created_by = u.id
      WHERE mt.deleted_at IS NULL
    `;
    const params = [];
    
    if (invoice_id) {
      query += ' AND mt.invoice_id = ?';
      params.push(invoice_id);
    }
    
    if (project_id) {
      query += ' AND mt.project_id = ?';
      params.push(project_id);
    }
    
    if (status) {
      query += ' AND mt.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY mt.transaction_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [transactions] = await db.execute(query, params);
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error fetching M-Pesa transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch M-Pesa transactions',
      error: error.message
    });
  }
});

app.post('/api/mpesa/transactions', async (req, res) => {
  try {
    const {
      invoice_id,
      project_id,
      transaction_id,
      amount,
      phone_number,
      payment_method,
      business_number,
      account_reference,
      client_name,
      client_email,
      response_data
    } = req.body;
    
    const userId = req.user?.id || 1;
    
    const query = `
      INSERT INTO mpesa_transactions (
        invoice_id, project_id, transaction_id, amount, phone_number,
        payment_method, business_number, account_reference, client_name,
        client_email, response_data, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      invoice_id,
      project_id,
      transaction_id,
      parseFloat(amount),
      phone_number,
      payment_method,
      business_number,
      account_reference,
      client_name,
      client_email,
      JSON.stringify(response_data || {}),
      userId
    ]);
    
    // Update invoice payment status if linked
    if (invoice_id) {
      await db.execute(
        'UPDATE invoices SET payment_status = ?, status = ?, updated_at = NOW() WHERE id = ?',
        ['pending', 'sent', invoice_id]
      );
    }
    
    res.json({
      success: true,
      message: 'M-Pesa transaction recorded successfully',
      transactionId: result.insertId
    });
  } catch (error) {
    console.error('Error creating M-Pesa transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create M-Pesa transaction',
      error: error.message
    });
  }
});

app.put('/api/mpesa/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.user?.id || 1;
    
    const {
      status,
      result_code,
      result_desc,
      completion_time,
      reconciliation_notes
    } = req.body;
    
    const query = `
      UPDATE mpesa_transactions 
      SET status = ?, result_code = ?, result_desc = ?, completion_time = ?,
          reconciliation_notes = ?, reconciled_by = ?, reconciled_at = NOW(),
          updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.execute(query, [
      status,
      result_code,
      result_desc,
      completion_time,
      reconciliation_notes,
      userId,
      userId,
      transactionId
    ]);
    
    // Update invoice status if payment is completed
    if (status === 'completed') {
      const [transaction] = await db.execute(
        'SELECT invoice_id FROM mpesa_transactions WHERE id = ?',
        [transactionId]
      );
      
      if (transaction[0] && transaction[0].invoice_id) {
        await db.execute(
          'UPDATE invoices SET payment_status = ?, status = ?, paid_date = CURDATE() WHERE id = ?',
          ['paid', 'paid', transaction[0].invoice_id]
        );
      }
    }
    
    res.json({
      success: true,
      message: 'M-Pesa transaction updated successfully'
    });
  } catch (error) {
    console.error('Error updating M-Pesa transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update M-Pesa transaction',
      error: error.message
    });
  }
});

// User Feedback APIs
app.get('/api/feedback', async (req, res) => {
  try {
    const { project_id, feedback_type, status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT uf.*, p.name as project_name, u.first_name, u.last_name,
             CONCAT(u.first_name, ' ', u.last_name) as user_name,
             responder.first_name as responder_first_name,
             responder.last_name as responder_last_name,
             CONCAT(responder.first_name, ' ', responder.last_name) as responder_name
      FROM user_feedback uf
      LEFT JOIN projects p ON uf.project_id = p.id
      LEFT JOIN users u ON uf.user_id = u.id
      LEFT JOIN users responder ON uf.responded_by = responder.id
      WHERE uf.deleted_at IS NULL
    `;
    const params = [];
    
    if (project_id) {
      query += ' AND uf.project_id = ?';
      params.push(project_id);
    }
    
    if (feedback_type) {
      query += ' AND uf.feedback_type = ?';
      params.push(feedback_type);
    }
    
    if (status) {
      query += ' AND uf.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY uf.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [feedback] = await db.execute(query, params);
    
    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const {
      project_id,
      user_id,
      feedback_type,
      rating,
      title,
      message,
      contact_name,
      contact_email,
      contact_phone,
      source,
      ip_address,
      user_agent
    } = req.body;
    
    const userId = req.user?.id || null;
    
    const query = `
      INSERT INTO user_feedback (
        project_id, user_id, feedback_type, rating, title, message,
        contact_name, contact_email, contact_phone, source,
        ip_address, user_agent, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      project_id,
      user_id,
      feedback_type,
      rating,
      title,
      message,
      contact_name,
      contact_email,
      contact_phone,
      source,
      ip_address,
      user_agent,
      userId
    ]);
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: result.insertId
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

app.put('/api/feedback/:id', async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.user?.id || 1;
    
    const {
      status,
      admin_response,
      assigned_to,
      internal_notes
    } = req.body;
    
    const query = `
      UPDATE user_feedback 
      SET status = ?, admin_response = ?, responded_by = ?, responded_at = NOW(),
          assigned_to = ?, internal_notes = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.execute(query, [
      status,
      admin_response,
      userId,
      assigned_to,
      internal_notes,
      userId,
      feedbackId
    ]);
    
    res.json({
      success: true,
      message: 'Feedback updated successfully'
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback',
      error: error.message
    });
  }
});

// Quotes Management APIs
app.get('/api/quotes', async (req, res) => {
  try {
    const { project_id, status, priority, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT q.*, p.name as project_name, u.first_name, u.last_name,
             CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
             inv.invoice_number as converted_invoice_number
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN users u ON q.created_by = u.id
      LEFT JOIN invoices inv ON q.converted_to_invoice_id = inv.id
      WHERE q.deleted_at IS NULL
    `;
    const params = [];
    
    if (project_id) {
      query += ' AND q.project_id = ?';
      params.push(project_id);
    }
    
    if (status) {
      query += ' AND q.status = ?';
      params.push(status);
    }
    
    if (priority) {
      query += ' AND q.priority = ?';
      params.push(priority);
    }
    
    query += ' ORDER BY q.issue_date DESC, q.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [quotes] = await db.execute(query, params);
    
    res.json({
      success: true,
      quotes
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes',
      error: error.message
    });
  }
});

app.post('/api/quotes', async (req, res) => {
  try {
    const {
      project_id,
      quote_type,
      title,
      description,
      subtotal,
      tax_rate,
      currency,
      exchange_rate,
      issue_date,
      valid_until,
      priority,
      client_name,
      client_email,
      client_phone,
      client_address,
      client_company,
      items,
      notes,
      payment_terms,
      terms_conditions,
      delivery_timeline,
      discount_type,
      discount_value,
      discount_reason
    } = req.body;
    
    const userId = req.user?.id || 1;
    
    // Generate unique quote number
    const quoteNumber = `QUOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Calculate total with discount
    const discountedSubtotal = discount_type === 'percentage' 
      ? parseFloat(subtotal) * (1 - parseFloat(discount_value || 0) / 100)
      : parseFloat(subtotal) - parseFloat(discount_value || 0);
    const totalAmount = discountedSubtotal * (1 + parseFloat(tax_rate || 0) / 100);
    
    const query = `
      INSERT INTO quotes (
        project_id, quote_number, quote_type, title, description,
        subtotal, tax_rate, currency, exchange_rate, issue_date, valid_until,
        priority, client_name, client_email, client_phone, client_address,
        client_company, items, notes, payment_terms, terms_conditions,
        delivery_timeline, discount_type, discount_value, discount_reason, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      project_id,
      quoteNumber,
      quote_type,
      title,
      description,
      parseFloat(subtotal),
      parseFloat(tax_rate || 0),
      currency,
      parseFloat(exchange_rate || 1),
      issue_date,
      valid_until,
      priority,
      client_name,
      client_email,
      client_phone,
      client_address,
      client_company,
      JSON.stringify(items || []),
      notes,
      payment_terms,
      terms_conditions,
      delivery_timeline,
      discount_type,
      parseFloat(discount_value || 0),
      discount_reason,
      userId
    ]);
    
    // Log quote creation activity
    await db.execute(
      'INSERT INTO quote_activities (quote_id, activity_type, description, user_id, user_type) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, 'created', `Quote ${quoteNumber} created for ${client_name}`, userId, 'admin']
    );
    
    res.json({
      success: true,
      message: 'Quote created successfully',
      quoteId: result.insertId,
      quoteNumber: quoteNumber
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quote',
      error: error.message
    });
  }
});

app.put('/api/quotes/:id', async (req, res) => {
  try {
    const quoteId = req.params.id;
    const userId = req.user?.id || 1;
    
    const {
      status,
      priority,
      notes,
      admin_response
    } = req.body;
    
    const query = `
      UPDATE quotes 
      SET status = ?, priority = ?, notes = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.execute(query, [status, priority, notes, userId, quoteId]);
    
    // Log status change activity
    if (status) {
      await db.execute(
        'INSERT INTO quote_activities (quote_id, activity_type, description, user_id, user_type) VALUES (?, ?, ?, ?, ?)',
        [quoteId, status, `Quote status changed to ${status}`, userId, 'admin']
      );
    }
    
    res.json({
      success: true,
      message: 'Quote updated successfully'
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quote',
      error: error.message
    });
  }
});

app.post('/api/quotes/:id/convert-to-invoice', async (req, res) => {
  try {
    const quoteId = req.params.id;
    const userId = req.user?.id || 1;
    
    const {
      invoice_title,
      due_date
    } = req.body;
    
    // Get quote details
    const [quoteData] = await db.execute(
      'SELECT * FROM quotes WHERE id = ? AND deleted_at IS NULL',
      [quoteId]
    );
    
    if (!quoteData.length) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    const quote = quoteData[0];
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create invoice from quote
    const invoiceQuery = `
      INSERT INTO invoices (
        project_id, invoice_number, invoice_type, title, description,
        subtotal, tax_rate, currency, exchange_rate, issue_date, due_date,
        payment_method, payment_phone, client_name, client_email, client_phone,
        client_address, items, notes, payment_terms, terms_conditions, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [invoiceResult] = await db.execute(invoiceQuery, [
      quote.project_id,
      invoiceNumber,
      'project_fee',
      invoice_title || `Invoice for ${quote.title}`,
      quote.description,
      quote.subtotal,
      quote.tax_rate,
      quote.currency,
      quote.exchange_rate,
      new Date().toISOString().split('T')[0],
      due_date,
      'mpesa',
      '+254799789956',
      quote.client_name,
      quote.client_email,
      quote.client_phone,
      quote.client_address,
      quote.items,
      `Converted from quote ${quote.quote_number}`,
      quote.payment_terms,
      quote.terms_conditions,
      userId
    ]);
    
    // Update quote status
    await db.execute(
      'UPDATE quotes SET status = ?, converted_to_invoice_id = ?, converted_at = NOW(), updated_by = ? WHERE id = ?',
      ['converted', invoiceResult.insertId, userId, quoteId]
    );
    
    // Log conversion activity
    await db.execute(
      'INSERT INTO quote_activities (quote_id, activity_type, description, user_id, user_type, activity_data) VALUES (?, ?, ?, ?, ?, ?)',
      [quoteId, 'converted', `Quote converted to invoice ${invoiceNumber}`, userId, 'admin', JSON.stringify({ invoiceId: invoiceResult.insertId, invoiceNumber })]
    );
    
    res.json({
      success: true,
      message: 'Quote converted to invoice successfully',
      invoiceId: invoiceResult.insertId,
      invoiceNumber: invoiceNumber
    });
  } catch (error) {
    console.error('Error converting quote to invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert quote to invoice',
      error: error.message
    });
  }
});

app.delete('/api/quotes/:id', async (req, res) => {
  try {
    const quoteId = req.params.id;
    const userId = req.user?.id || 1;
    
    // Soft delete the quote
    await db.execute(
      'UPDATE quotes SET deleted_at = NOW(), deleted_by = ? WHERE id = ?',
      [userId, quoteId]
    );
    
    res.json({
      success: true,
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quote',
      error: error.message
    });
  }
});

// Quote Items API
app.get('/api/quotes/:quoteId/items', async (req, res) => {
  try {
    const { quoteId } = req.params;
    
    const [items] = await db.execute(
      'SELECT * FROM quote_items WHERE quote_id = ? ORDER BY display_order',
      [quoteId]
    );
    
    res.json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Error fetching quote items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote items',
      error: error.message
    });
  }
});

app.post('/api/quotes/:quoteId/items', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const {
      item_name,
      item_description,
      item_type,
      unit_price,
      quantity,
      discount_percentage,
      unit,
      sku,
      category,
      notes,
      display_order
    } = req.body;
    
    const userId = req.user?.id || 1;
    
    const query = `
      INSERT INTO quote_items (
        quote_id, item_name, item_description, item_type, unit_price,
        quantity, discount_percentage, unit, sku, category, notes, display_order, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      quoteId,
      item_name,
      item_description,
      item_type,
      parseFloat(unit_price),
      parseFloat(quantity),
      parseFloat(discount_percentage || 0),
      unit,
      sku,
      category,
      notes,
      display_order || 0,
      userId
    ]);
    
    res.json({
      success: true,
      message: 'Quote item added successfully',
      itemId: result.insertId
    });
  } catch (error) {
    console.error('Error adding quote item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add quote item',
      error: error.message
    });
  }
});

// Quote Activities API
app.get('/api/quotes/:quoteId/activities', async (req, res) => {
  try {
    const { quoteId } = req.params;
    
    const [activities] = await db.execute(`
      SELECT qa.*, u.first_name, u.last_name,
             CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM quote_activities qa
      LEFT JOIN users u ON qa.user_id = u.id
      WHERE qa.quote_id = ?
      ORDER BY qa.created_at DESC
    `, [quoteId]);
    
    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Error fetching quote activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote activities',
      error: error.message
    });
  }
});

// Document Management APIs
app.get('/api/documents/:type/:id/pdf', async (req, res) => {
  try {
    const { type, id } = req.params;
    let document = null;
    
    // Get document based on type
    if (type === 'invoices') {
      const [docs] = await db.execute('SELECT * FROM invoices WHERE id = ?', [id]);
      document = docs[0];
    } else if (type === 'quotes') {
      const [docs] = await db.execute('SELECT * FROM quotes WHERE id = ?', [id]);
      document = docs[0];
    } else if (type === 'receipt' || type === 'transactions') {
      const [docs] = await db.execute('SELECT * FROM mpesa_transactions WHERE id = ?', [id]);
      document = docs[0];
    }
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Generate PDF content (simplified version)
    const pdfContent = generatePDFContent(type, document);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-${document.invoice_number || document.quote_number || document.transaction_id}.pdf"`);
    res.send(pdfContent);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
});

app.post('/api/documents/generate/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let document = null;
    
    // Get document based on type
    if (type === 'invoices') {
      const [docs] = await db.execute('SELECT * FROM invoices WHERE id = ?', [id]);
      document = docs[0];
    } else if (type === 'quotes') {
      const [docs] = await db.execute('SELECT * FROM quotes WHERE id = ?', [id]);
      document = docs[0];
    } else if (type === 'receipt' || type === 'transactions') {
      const [docs] = await db.execute('SELECT * FROM mpesa_transactions WHERE id = ?', [id]);
      document = docs[0];
    }
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Update PDF generation status
    if (type === 'invoices') {
      await db.execute(
        'UPDATE invoices SET pdf_generated = TRUE, pdf_generated_at = NOW() WHERE id = ?',
        [id]
      );
    } else if (type === 'quotes') {
      await db.execute(
        'UPDATE quotes SET pdf_generated = TRUE, pdf_generated_at = NOW() WHERE id = ?',
        [id]
      );
    }
    
    // Generate PDF content
    const pdfContent = generatePDFContent(type, document);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-${document.invoice_number || document.quote_number || document.transaction_id}.pdf"`);
    res.send(pdfContent);
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate document',
      error: error.message
    });
  }
});

app.post('/api/documents/send', async (req, res) => {
  try {
    const { documentId, documentType, email, subject, message } = req.body;
    
    // Get document details
    let document = null;
    if (documentType === 'invoices') {
      const [docs] = await db.execute('SELECT * FROM invoices WHERE id = ?', [documentId]);
      document = docs[0];
    } else if (documentType === 'quotes') {
      const [docs] = await db.execute('SELECT * FROM quotes WHERE id = ?', [documentId]);
      document = docs[0];
    } else if (documentType === 'receipt' || documentType === 'transactions') {
      const [docs] = await db.execute('SELECT * FROM mpesa_transactions WHERE id = ?', [documentId]);
      document = docs[0];
    }
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Generate PDF
    const pdfContent = generatePDFContent(documentType, document);
    
    // Send email (simplified - in production, use nodemailer or similar)
    const emailData = {
      to: email,
      subject: subject,
      text: message,
      attachments: [{
        filename: `${documentType}-${document.invoice_number || document.quote_number}.pdf`,
        content: pdfContent,
        contentType: 'application/pdf'
      }]
    };
    
    // Update email sent status
    if (documentType === 'invoices') {
      await db.execute(
        'UPDATE invoices SET email_sent = TRUE, email_sent_at = NOW() WHERE id = ?',
        [documentId]
      );
    } else if (documentType === 'quotes') {
      await db.execute(
        'UPDATE quotes SET email_sent = TRUE, email_sent_at = NOW() WHERE id = ?',
        [documentId]
      );
    }
    
    // Log email sending activity
    await db.execute(
      'INSERT INTO activity_logs (user_id, action_type, action_description, created_at) VALUES (?, ?, ?, NOW())',
      [1, 'send_document', `Sent ${documentType} ${document.invoice_number || document.quote_number} to ${email}`]
    );
    
    res.json({
      success: true,
      message: 'Document sent successfully'
    });
  } catch (error) {
    console.error('Error sending document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send document',
      error: error.message
    });
  }
});

app.get('/api/documents/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Get all documents for a client
    const [invoices] = await db.execute(
      'SELECT *, "invoice" as type FROM invoices WHERE client_id = ? OR client_name IN (SELECT CONCAT(first_name, " ", last_name) FROM users WHERE id = ?)',
      [clientId, clientId]
    );
    
    const [quotes] = await db.execute(
      'SELECT *, "quote" as type FROM quotes WHERE client_id = ? OR client_name IN (SELECT CONCAT(first_name, " ", last_name) FROM users WHERE id = ?)',
      [clientId, clientId]
    );
    
    const [transactions] = await db.execute(
      'SELECT *, "receipt" as type FROM mpesa_transactions WHERE client_id = ? OR client_name IN (SELECT CONCAT(first_name, " ", last_name) FROM users WHERE id = ?)',
      [clientId, clientId]
    );
    
    res.json({
      success: true,
      documents: [...invoices, ...quotes, ...transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    });
  } catch (error) {
    console.error('Error fetching client documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client documents',
      error: error.message
    });
  }
});

// Project Documents API
app.get('/api/projects/:projectId/documents', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get all documents related to this project
    const [invoices] = await db.execute(
      'SELECT *, "invoice" as type FROM invoices WHERE project_id = ? AND deleted_at IS NULL',
      [projectId]
    );
    
    const [quotes] = await db.execute(
      'SELECT *, "quote" as type FROM quotes WHERE project_id = ? AND deleted_at IS NULL',
      [projectId]
    );
    
    const [transactions] = await db.execute(
      'SELECT *, "receipt" as type FROM mpesa_transactions WHERE project_id = ?',
      [projectId]
    );
    
    // Combine all documents and sort by date
    const allDocuments = [...invoices, ...quotes, ...transactions].sort((a, b) => {
      const dateA = new Date(a.issue_date || a.transaction_date || a.created_at);
      const dateB = new Date(b.issue_date || b.transaction_date || b.created_at);
      return dateB - dateA;
    });
    
    res.json({
      success: true,
      documents: allDocuments
    });
  } catch (error) {
    console.error('Error fetching project documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project documents',
      error: error.message
    });
  }
});

// Currency Management APIs
app.get('/api/currencies', async (req, res) => {
  try {
    const { active, region, search } = req.query;
    let query = 'SELECT * FROM currencies WHERE 1=1';
    const params = [];

    if (active !== undefined) {
      query += ' AND is_active = ?';
      params.push(active === 'true');
    }

    if (region) {
      query += ' AND region LIKE ?';
      params.push(`%${region}%`);
    }

    if (search) {
      query += ' AND (name LIKE ? OR code LIKE ? OR symbol LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY is_default DESC, name ASC';

    const [currencies] = await db.execute(query, params);
    res.json({
      success: true,
      currencies
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currencies',
      error: error.message
    });
  }
});

app.post('/api/currencies', async (req, res) => {
  try {
    const { code, name, symbol, exchange_rate, region, is_active = true } = req.body;

    if (!code || !name || !symbol || !exchange_rate) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: code, name, symbol, exchange_rate'
      });
    }

    const [result] = await db.execute(
      'INSERT INTO currencies (code, name, symbol, exchange_rate, region, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [code.toUpperCase(), name, symbol, exchange_rate, region, is_active]
    );

    res.json({
      success: true,
      message: 'Currency added successfully',
      currencyId: result.insertId
    });
  } catch (error) {
    console.error('Error adding currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add currency',
      error: error.message
    });
  }
});

app.put('/api/currencies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, symbol, exchange_rate, region, is_active } = req.body;

    const [result] = await db.execute(
      'UPDATE currencies SET name = ?, symbol = ?, exchange_rate = ?, region = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
      [name, symbol, exchange_rate, region, is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    res.json({
      success: true,
      message: 'Currency updated successfully'
    });
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update currency',
      error: error.message
    });
  }
});

app.delete('/api/currencies/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      'UPDATE currencies SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    res.json({
      success: true,
      message: 'Currency deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate currency',
      error: error.message
    });
  }
});

app.post('/api/currencies/:id/set-default', async (req, res) => {
  try {
    const { id } = req.params;

    // First, unset all default currencies
    await db.execute('UPDATE currencies SET is_default = FALSE, updated_at = NOW()');

    // Then set the new default
    const [result] = await db.execute(
      'UPDATE currencies SET is_default = TRUE, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    res.json({
      success: true,
      message: 'Default currency updated successfully'
    });
  } catch (error) {
    console.error('Error setting default currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default currency',
      error: error.message
    });
  }
});

// Exchange Rate Update API
app.post('/api/currencies/update-exchange-rates', async (req, res) => {
  try {
    const { rates } = req.body; // Expected format: [{ code: 'USD', rate: 0.0065 }, ...]

    if (!Array.isArray(rates)) {
      return res.status(400).json({
        success: false,
        message: 'Rates must be an array'
      });
    }

    const updatePromises = rates.map(async ({ code, rate }) => {
      await db.execute(
        'UPDATE currencies SET exchange_rate = ?, updated_at = NOW() WHERE code = ?',
        [rate, code.toUpperCase()]
      );
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Exchange rates updated successfully'
    });
  } catch (error) {
    console.error('Error updating exchange rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exchange rates',
      error: error.message
    });
  }
});

// Currency Conversion API
app.post('/api/currencies/convert', async (req, res) => {
  try {
    const { amount, from_currency, to_currency } = req.body;

    if (!amount || !from_currency || !to_currency) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: amount, from_currency, to_currency'
      });
    }

    // Get exchange rates
    const [fromCurrency] = await db.execute(
      'SELECT exchange_rate FROM currencies WHERE code = ? AND is_active = TRUE',
      [from_currency.toUpperCase()]
    );

    const [toCurrency] = await db.execute(
      'SELECT exchange_rate FROM currencies WHERE code = ? AND is_active = TRUE',
      [to_currency.toUpperCase()]
    );

    if (fromCurrency.length === 0 || toCurrency.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'One or both currencies not found or inactive'
      });
    }

    // Convert: amount * (to_rate / from_rate)
    const convertedAmount = amount * (toCurrency[0].exchange_rate / fromCurrency[0].exchange_rate);

    res.json({
      success: true,
      original_amount: amount,
      from_currency: from_currency.toUpperCase(),
      to_currency: to_currency.toUpperCase(),
      converted_amount: convertedAmount,
      exchange_rate_used: toCurrency[0].exchange_rate / fromCurrency[0].exchange_rate
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert currency',
      error: error.message
    });
  }
});

// Admin Authentication handler - shared logic
async function handleAdminAuth(req, res) {
  try {
    const { email, password } = req.body;
    
    console.log(`[ADMIN LOGIN] Login attempt received:`, { email, hasPassword: !!password });

    // IP RESTRICTION — admin auth only from this PC (loopback). Handles ::ffff:127.0.0.1 etc.
    const clientIP = getClientIpForAdmin(req);
    console.log(`[ADMIN LOGIN] Client IP: ${clientIP}`);
    
    if (!isLocalAdminIp(clientIP)) {
      console.log(`[SECURITY] Unauthorized admin access attempt from IP: ${clientIP}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied from this location'
      });
    }

    // RATE LIMITING - Check recent attempts from this IP
    const rateLimitKey = `admin_login_attempts_${clientIP}`;
    let recentAttempts = 0;
    if (redis) {
      recentAttempts = await redis.get(rateLimitKey) || 0;
    } else {
      const rateData = memoryStore.get(rateLimitKey) || { count: 0, expires: 0 };
      recentAttempts = rateData.expires > Date.now() ? rateData.count : 0;
    }
    
    if (recentAttempts > 5) {
      console.log(`[SECURITY] Rate limit exceeded for IP: ${clientIP}`);
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again later.'
      });
    }

    // FAILED LOGIN TRACKING - Check if account is locked
    const lockoutKey = `admin_account_locked_${email}`;
    let isLocked = false;
    if (redis) {
      isLocked = await redis.get(lockoutKey);
    } else {
      const lockData = memoryStore.get(lockoutKey) || { locked: false, expires: 0 };
      isLocked = lockData.expires > Date.now() && lockData.locked;
    }
    if (isLocked) {
      console.log(`[SECURITY] Locked account login attempt: ${email}`);
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to failed attempts'
      });
    }

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin user by email from admin_users table
    console.log(`[ADMIN LOGIN] Querying admin_users table for: ${email}`);
    const [admins] = await mainDb.query(
      'SELECT * FROM admin_users WHERE email = ? AND is_active = TRUE AND deleted_at IS NULL',
      [email]
    );
    console.log(`[ADMIN LOGIN] Query result: ${admins.length} admin(s) found`);

    if (admins.length === 0) {
      await trackFailedLogin(email, clientIP);
      console.log(`[SECURITY] Admin not found attempt: ${email} from IP: ${clientIP}`);
      return res.status(401).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    const user = admins[0];
    console.log(`[ADMIN LOGIN] Found admin: ${user.email}, ID: ${user.id}, checking password...`);

    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    console.log(`[ADMIN LOGIN] Password validation: ${isPasswordValid ? 'VALID' : 'INVALID'}`);

    if (!isPasswordValid) {
      await trackFailedLogin(email, clientIP);
      console.log(`[SECURITY] Invalid password attempt: ${email} from IP: ${clientIP}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Clear failed attempts on successful login
    await clearFailedAttempts(email, clientIP);

    // Update last login for admin
    await mainDb.query(
      'UPDATE admin_users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?',
      [clientIP, user.id]
    );

    console.log(`[SECURITY] Successful admin login: ${email} from IP: ${clientIP}`);

    const token = signAdminSessionToken(user.id);

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone_number,
        role: 'admin',
        admin_level: user.admin_level,
        access_level: user.access_level,
        department: user.department,
        profile_photo: user.profile_photo_blob ? true : false,
        last_login: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[SECURITY] Admin authentication error:', error);
    console.error('[SECURITY] Error stack:', error.stack);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Server error. Please try again in a moment.';
    let statusCode = 500;
    
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_TABLE_ERROR') {
      errorMessage = 'Database configuration error: Required tables are missing';
      console.error('[SECURITY] Database tables missing. Please run database migrations.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = 'Database connection failed. Please check database configuration';
    } else if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'Email already exists';
      statusCode = 409;
    } else if (error.message && error.message.includes('bcrypt')) {
      errorMessage = 'Password verification system error';
    } else if (error.message && error.message.includes('crypto')) {
      errorMessage = 'Security token generation error';
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      errorId: Date.now().toString(36) // For tracking in logs
    });
  }
}

// Admin Authentication API with Security Lockdown
app.post('/api/admin/authenticate', handleAdminAuth);

// Frontend-compatible endpoint
app.post('/api/admin-verification/authenticate-enhanced', handleAdminAuth);

// Developer Authentication handler - shared logic
async function handleDeveloperAuth(req, res) {
  try {
    const { email, password } = req.body;
    
    console.log(`[DEV LOGIN] Login attempt received:`, { email, hasPassword: !!password });

    // IP RESTRICTION
    const clientIP = getClientIpForAdmin(req);
    console.log(`[DEV LOGIN] Client IP: ${clientIP}`);
    
    if (!isLocalAdminIp(clientIP)) {
      console.log(`[SECURITY] Unauthorized developer access attempt from IP: ${clientIP}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied from this location'
      });
    }

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find developer by email
    console.log(`[DEV LOGIN] Querying developer_users table for: ${email}`);
    const [developers] = await mainDb.query(
      'SELECT * FROM developer_users WHERE email = ? AND is_active = TRUE AND deleted_at IS NULL',
      [email]
    );
    console.log(`[DEV LOGIN] Query result: ${developers.length} developer(s) found`);

    if (developers.length === 0) {
      console.log(`[SECURITY] Developer not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Developer account not found'
      });
    }

    const user = developers[0];
    console.log(`[DEV LOGIN] Found developer: ${user.email}, ID: ${user.id}, checking password...`);

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    console.log(`[DEV LOGIN] Password validation: ${isPasswordValid ? 'VALID' : 'INVALID'}`);
    
    if (!isPasswordValid) {
      console.log(`[SECURITY] Invalid developer password: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Update last login
    await mainDb.query(
      'UPDATE developer_users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?',
      [clientIP, user.id]
    );

    console.log(`[SECURITY] Successful developer login: ${email}`);

    const token = signAdminSessionToken(user.id);

    res.json({
      success: true,
      message: 'Developer authentication successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: user.display_name,
        email: user.email,
        phone: user.phone_number,
        role: 'developer',
        developer_level: user.developer_level,
        tech_stack: user.tech_stack,
        profile_photo: user.profile_photo_blob ? true : false,
        profile_photo_id: user.profile_photo_id,
        last_login: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[SECURITY] Developer authentication error:', error);
    console.error('[SECURITY] Error stack:', error.stack);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Server error. Please try again in a moment.';
    let statusCode = 500;
    
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_TABLE_ERROR') {
      errorMessage = 'Database configuration error: Required tables are missing';
      console.error('[SECURITY] Database tables missing. Please run database migrations.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = 'Database connection failed. Please check database configuration';
    } else if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'Email already exists';
      statusCode = 409;
    } else if (error.message && error.message.includes('bcrypt')) {
      errorMessage = 'Password verification system error';
    } else if (error.message && error.message.includes('crypto')) {
      errorMessage = 'Security token generation error';
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      errorId: Date.now().toString(36) // For tracking in logs
    });
  }
}

// Developer Authentication API
app.post('/api/developer/authenticate', handleDeveloperAuth);

// Frontend-compatible endpoint
app.post('/api/developer-verification/authenticate', handleDeveloperAuth);

// Admin/Developer registration (frontend expects this endpoint)
app.post('/api/admin-verification/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, role, profile_photo_base64, profile_photo_mime_type, profile_photo_file_name } = req.body;
    
    console.log(`[ADMIN-VERIFICATION REGISTER] Received:`, { first_name, last_name, email, role });
    
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);
    
    // Convert base64 photo to buffer if provided
    let profilePhotoBlob = null;
    let photoMimeType = profile_photo_mime_type || null;
    let photoFileName = profile_photo_file_name || null;
    
    if (profile_photo_base64) {
      try {
        // Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Data = profile_photo_base64.replace(/^data:image\/\w+;base64,/, '');
        profilePhotoBlob = Buffer.from(base64Data, 'base64');
        console.log(`[ADMIN-VERIFICATION] Profile photo converted: ${profilePhotoBlob.length} bytes`);
        
        // Extract mime type from data URI if provided
        if (profile_photo_base64.match(/^data:image\/(\w+);base64,/)) {
          photoMimeType = `image/${profile_photo_base64.match(/^data:image\/(\w+);base64,/)[1]}`;
        }
      } catch (e) {
        console.error('[ADMIN-VERIFICATION] Failed to decode base64 photo:', e.message);
      }
    }
    
    let result;
    let userId;
    
    if (role === 'admin') {
      // Check if email already exists in admin_users
      const [existing] = await mainDb.query(
        'SELECT id FROM admin_users WHERE email = ? AND deleted_at IS NULL',
        [email]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Admin user with this email already exists'
        });
      }
      
      // Insert into admin_users table with profile photo BLOB
      [result] = await mainDb.query(
        `INSERT INTO admin_users (
          email, password_hash, first_name, last_name, 
          admin_level, access_level, is_active, email_verified, 
          profile_photo_blob, profile_photo_mime_type, profile_photo_file_name
        ) VALUES (?, ?, ?, ?, ?, 'full', 1, 1, ?, ?, ?)`,
        [email, hashedPassword, first_name, last_name, 'admin', profilePhotoBlob, photoMimeType, photoFileName]
      );
      userId = result.insertId;
      console.log(`[ADMIN-VERIFICATION] Admin created: ${email}, ID: ${userId}, Photo: ${profilePhotoBlob ? profilePhotoBlob.length + ' bytes' : 'none'}`);
      
    } else if (role === 'developer') {
      // Check if email already exists in developer_users
      const [existing] = await mainDb.query(
        'SELECT id FROM developer_users WHERE email = ? AND deleted_at IS NULL',
        [email]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Developer user with this email already exists'
        });
      }
      
      // Insert into developer_users table with profile photo BLOB
      [result] = await mainDb.query(
        `INSERT INTO developer_users (
          email, password_hash, first_name, last_name,
          developer_level, is_active, email_verified,
          profile_photo_blob, profile_photo_mime_type, profile_photo_file_name
        ) VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?, ?)`,
        [email, hashedPassword, first_name, last_name, 'mid', profilePhotoBlob, photoMimeType, photoFileName]
      );
      userId = result.insertId;
      console.log(`[ADMIN-VERIFICATION] Developer created: ${email}, ID: ${userId}, Photo: ${profilePhotoBlob ? profilePhotoBlob.length + ' bytes' : 'none'}`);
      
    } else {
      return res.status(400).json({
        success: false,
        message: 'Role must be "admin" or "developer"'
      });
    }
    
    res.json({
      success: true,
      message: `${role} account created successfully`,
      userId: userId,
      role: role,
      has_photo: !!profilePhotoBlob
    });
    
  } catch (error) {
    console.error('[ADMIN-VERIFICATION REGISTER] Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to create account', error: error.message });
  }
});

// Validate admin session token (required for admin UI — not forgeable without server secret)
app.get('/api/admin/session', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      return res.status(401).json({ success: false, message: 'No session token' });
    }
    const payload = verifyAdminSessionToken(m[1].trim());
    if (!payload) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }

    // Check admin_users table first
    let [admins] = await mainDb.query(
      `SELECT id, email, first_name, last_name, phone_number, admin_level, access_level, department
       FROM admin_users
       WHERE id = ? AND is_active = TRUE AND deleted_at IS NULL
       LIMIT 1`,
      [payload.uid]
    );

    // If not found in admin_users, check developer_users
    let user = null;
    let role = 'admin';
    
    if (admins.length === 0) {
      const [developers] = await mainDb.query(
        `SELECT id, email, first_name, last_name, phone_number, developer_level, tech_stack
         FROM developer_users
         WHERE id = ? AND is_active = TRUE AND deleted_at IS NULL
         LIMIT 1`,
        [payload.uid]
      );
      
      if (developers.length === 0) {
        return res.status(403).json({ success: false, message: 'Admin privileges required' });
      }
      
      user = developers[0];
      role = 'developer';
    } else {
      user = admins[0];
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone_number,
        role: role,
        admin_level: user.admin_level,
        access_level: user.access_level,
        department: user.department,
        developer_level: user.developer_level,
        tech_stack: user.tech_stack
      }
    });
  } catch (error) {
    console.error('Admin session error:', error);
    res.status(500).json({ success: false, message: 'Session check failed' });
  }
});

// Properties API
app.get('/api/properties', async (req, res) => {
  try {
    const { status, property_type, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT p.*, c.name as company_name, c.logo_url as company_logo
      FROM properties p
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE p.deleted_at IS NULL
    `;
    const params = [];
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    if (property_type) {
      query += ' AND p.property_type = ?';
      params.push(property_type);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [properties] = await mainDb.query(query, params);
    
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, message: 'Error fetching properties', error: error.message });
  }
});

app.post('/api/properties', async (req, res) => {
  try {
    const property = req.body;
    const [result] = await mainDb.query(
      'INSERT INTO properties (title, description, property_type, status, price, bedrooms, bathrooms, area, location_address, location_city, location_country, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [property.title, property.description, property.property_type, property.status, property.price, property.bedrooms, property.bathrooms, property.area, property.location_address, property.location_city, property.location_country, property.company_id]
    );
    
    res.json({ success: true, propertyId: result.insertId });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ success: false, message: 'Error creating property', error: error.message });
  }
});

// Companies API
app.get('/api/companies', async (req, res) => {
  try {
    const { industry, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM companies WHERE deleted_at IS NULL';
    const params = [];
    
    if (industry) {
      query += ' AND industry = ?';
      params.push(industry);
    }
    
    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [companies] = await mainDb.query(query, params);
    
    res.json({ success: true, companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, message: 'Error fetching companies', error: error.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const company = req.body;
    const [result] = await mainDb.query(
      'INSERT INTO companies (name, description, industry, website_url, phone, email, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [company.name, company.description, company.industry, company.website_url, company.phone, company.email, company.logo_url]
    );
    
    res.json({ success: true, companyId: result.insertId });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ success: false, message: 'Error creating company', error: error.message });
  }
});

// Blog Articles API
app.get('/api/blog-articles', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const [articles] = await mainDb.query(
      'SELECT * FROM blog_articles WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    
    res.json({ success: true, articles });
  } catch (error) {
    console.error('Error fetching blog articles:', error);
    res.status(500).json({ success: false, message: 'Error fetching blog articles', error: error.message });
  }
});

app.post('/api/blog-articles', async (req, res) => {
  try {
    const article = req.body;
    const [result] = await mainDb.query(
      'INSERT INTO blog_articles (title, excerpt, content, author_id, status, featured_image_id) VALUES (?, ?, ?, ?, ?, ?)',
      [article.title, article.excerpt, article.content, article.author_id, article.status, article.featured_image_id]
    );
    
    res.json({ success: true, articleId: result.insertId });
  } catch (error) {
    console.error('Error creating blog article:', error);
    res.status(500).json({ success: false, message: 'Error creating blog article', error: error.message });
  }
});

// Contact Forms API
app.get('/api/contact-forms', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const [forms] = await mainDb.query(
      'SELECT * FROM contact_forms ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    
    res.json({ success: true, forms });
  } catch (error) {
    console.error('Error fetching contact forms:', error);
    res.status(500).json({ success: false, message: 'Error fetching contact forms', error: error.message });
  }
});

app.post('/api/contact-forms', async (req, res) => {
  try {
    const form = req.body;
    const [result] = await mainDb.query(
      'INSERT INTO contact_forms (name, email, phone, company, subject, message, preferred_contact) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [form.name, form.email, form.phone, form.company, form.subject, form.message, form.preferred_contact]
    );
    
    res.json({ success: true, formId: result.insertId });
  } catch (error) {
    console.error('Error creating contact form:', error);
    res.status(500).json({ success: false, message: 'Error creating contact form', error: error.message });
  }
});

// Videos API
app.get('/api/videos', async (req, res) => {
  try {
    const { is_active = true, limit = 20, offset = 0 } = req.query;
    
    const [videos] = await mainDb.query(
      'SELECT * FROM videos WHERE is_active = ? ORDER BY display_order ASC, created_at DESC LIMIT ? OFFSET ?',
      [is_active === 'true', parseInt(limit), parseInt(offset)]
    );
    
    res.json({ success: true, videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ success: false, message: 'Error fetching videos', error: error.message });
  }
});

app.post('/api/videos', async (req, res) => {
  try {
    const video = req.body;
    const [result] = await mainDb.query(
      'INSERT INTO videos (title, description, video_url, thumbnail_url, is_active, is_featured, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [video.title, video.description, video.video_url, video.thumbnail_url, video.is_active, video.is_featured, video.display_order || 0]
    );
    
    res.json({ success: true, videoId: result.insertId });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ success: false, message: 'Error creating video', error: error.message });
  }
});

// Delete operations
app.delete('/api/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    let table;
    switch (type) {
      case 'properties':
        table = 'properties';
        break;
      case 'companies':
        table = 'companies';
        break;
      case 'blog-articles':
        table = 'blog_articles';
        break;
      case 'contact-forms':
        table = 'contact_forms';
        break;
      case 'videos':
        table = 'videos';
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid type' });
    }
    
    await mainDb.query(`UPDATE ${table} SET deleted_at = NOW() WHERE id = ?`, [id]);
    
    res.json({ success: true, message: `${type} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting ${req.params.type}:`, error);
    res.status(500).json({ success: false, message: `Error deleting ${req.params.type}`, error: error.message });
  }
});

// Images API - Store profile photo temporarily (frontend calls this before registration)
app.post('/api/images/profile', async (req, res) => {
  try {
    const { dataBase64, contentType, fileName } = req.body;
    
    if (!dataBase64) {
      return res.status(400).json({ success: false, message: 'Image data (dataBase64) is required' });
    }
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(dataBase64, 'base64');
    
    // Insert into images table
    const [result] = await mainDb.query(
      'INSERT INTO images (data, content_type, file_name, created_at) VALUES (?, ?, ?, NOW())',
      [imageBuffer, contentType || 'image/jpeg', fileName || 'profile.jpg']
    );
    
    const imageId = result.insertId;
    
    console.log(`[IMAGES] Profile photo stored: ID=${imageId}, Size=${imageBuffer.length} bytes`);
    
    res.json({ 
      success: true, 
      image_id: imageId,
      message: 'Profile photo uploaded successfully'
    });
  } catch (error) {
    console.error('[IMAGES] Profile photo upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload profile photo',
      error: error.message 
    });
  }
});

// Profile photo upload endpoint
app.post('/api/users/upload-profile-photo', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Profile photo is required' 
      });
    }
    
    // Update user's profile photo in database
    const [result] = await mainDb.query(
      'UPDATE users SET profile_photo_blob = ?, profile_photo_mime_type = ?, profile_photo_file_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.file.buffer, req.file.mimetype, req.file.originalname, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Profile photo uploaded successfully',
      profilePhoto: {
        mimeType: req.file.mimetype,
        fileName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload profile photo',
      error: error.message 
    });
  }
});

// Profile photo retrieval endpoint
app.get('/api/users/profile-photo/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [users] = await mainDb.query(
      'SELECT profile_photo_blob, profile_photo_mime_type, profile_photo_file_name FROM users WHERE id = ? AND profile_photo_blob IS NOT NULL',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile photo not found' 
      });
    }
    
    const user = users[0];
    
    res.set({
      'Content-Type': user.profile_photo_mime_type,
      'Content-Disposition': `inline; filename="${user.profile_photo_file_name}"`
    });
    
    res.send(user.profile_photo_blob);
  } catch (error) {
    console.error('Profile photo retrieval error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve profile photo',
      error: error.message 
    });
  }
});

// Admin/Developer profile photo upload endpoint (accepts base64 JSON)
app.post('/api/admin/profile-photo', async (req, res) => {
  try {
    const { userId, role, profile_photo_base64, profile_photo_mime_type, profile_photo_file_name } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and role are required' 
      });
    }
    
    if (!profile_photo_base64) {
      return res.status(400).json({ 
        success: false, 
        message: 'Profile photo base64 data is required' 
      });
    }
    
    // Convert base64 to buffer
    let profilePhotoBlob;
    try {
      const base64Data = profile_photo_base64.replace(/^data:image\/\w+;base64,/, '');
      profilePhotoBlob = Buffer.from(base64Data, 'base64');
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid base64 image data'
      });
    }
    
    // Update appropriate table based on role
    let tableName = role === 'admin' ? 'admin_users' : 'developer_users';
    
    const [result] = await mainDb.query(
      `UPDATE ${tableName} SET profile_photo_blob = ?, profile_photo_mime_type = ?, profile_photo_file_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [profilePhotoBlob, profile_photo_mime_type || 'image/jpeg', profile_photo_file_name || 'profile.jpg', userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Profile photo uploaded successfully',
      size: profilePhotoBlob.length
    });
  } catch (error) {
    console.error('Admin profile photo upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload profile photo',
      error: error.message 
    });
  }
});

// Admin/Developer profile photo retrieval endpoint
app.get('/api/admin/profile-photo/:role/:userId', async (req, res) => {
  try {
    const { role, userId } = req.params;
    
    if (!role || !userId || !['admin', 'developer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role (admin|developer) and userId are required'
      });
    }
    
    const tableName = role === 'admin' ? 'admin_users' : 'developer_users';
    
    const [users] = await mainDb.query(
      `SELECT profile_photo_blob, profile_photo_mime_type, profile_photo_file_name FROM ${tableName} WHERE id = ? AND profile_photo_blob IS NOT NULL`,
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile photo not found' 
      });
    }
    
    const user = users[0];
    
    res.set({
      'Content-Type': user.profile_photo_mime_type || 'image/jpeg',
      'Content-Disposition': `inline; filename="${user.profile_photo_file_name || 'profile.jpg'}"`
    });
    
    res.send(user.profile_photo_blob);
  } catch (error) {
    console.error('Admin profile photo retrieval error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve profile photo',
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Serve dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// 404 handler
app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  } else if (req.accepts('json')) {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found',
      path: req.path
    });
  } else {
    res.status(404).send('Not found');
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to MySQL server at ${process.env.DB_HOST || 'localhost'}`);
  console.log(`Access the API at http://localhost:${PORT}/api`);
  
  console.log(`\n========================================`);
  console.log(`USER AUTH PLATFORM (users table)`);
  console.log(`========================================`);
  console.log(`POST /api/users/register          - Register with photo BLOB`);
  console.log(`POST /api/users/login             - Login returns photo URL`);
  console.log(`GET  /api/users/profile-photo/:id - Retrieve user photo`);
  
  console.log(`\n========================================`);
  console.log(`ADMIN AUTH PLATFORM (admin_users table)`);
  console.log(`========================================`);
  console.log(`POST /api/admin-verification/register              - Register with photo BLOB`);
  console.log(`POST /api/admin-verification/authenticate-enhanced - Login returns photo info`);
  console.log(`GET  /api/admin/profile-photo/admin/:id            - Retrieve admin photo`);
  
  console.log(`\n========================================`);
  console.log(`DEVELOPER AUTH PLATFORM (developer_users table)`);
  console.log(`========================================`);
  console.log(`POST /api/admin-verification/register           - Register with photo BLOB`);
  console.log(`POST /api/developer-verification/authenticate   - Login returns photo info`);
  console.log(`GET  /api/admin/profile-photo/developer/:id     - Retrieve dev photo`);
  console.log(`========================================\n`);
});
