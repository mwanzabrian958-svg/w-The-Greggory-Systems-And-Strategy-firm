/**
 * AUTH PROTOCOL - ADMIN ONLY
 * This file MUST ONLY reference the `admin_users` table.
 * NEVER query other identity tables from this file.
 * See AUTH_PROTOCOL.md for full specification.
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { authEndpointValidator } = require('../middleware/authEndpointValidator');
const {
  createAdminSession,
  revokeAdminSession,
} = require('../utils/adminSessionState');
const { ADMIN_SESSION_COOKIE, getCookie, setSessionCookie, clearSessionCookie } = require('../utils/sessionCookies');

// Apply endpoint validation middleware to admin routes
router.use(authEndpointValidator('admin', 'admin_users'));

// Admin Authentication - LOGIN
router.post('/authenticate-enhanced', (req, res) => {
  console.log('[AUTH] Login attempt:', req.body.email);
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
  
  db.query(
    `SELECT au.id, au.email, au.first_name, au.last_name, au.display_name,
            au.password_hash, au.admin_level, au.profile_image_id,
            (au.profile_photo_blob IS NOT NULL OR i.id IS NOT NULL) AS has_photo
     FROM admin_users au
     LEFT JOIN images i ON i.id = au.profile_image_id
     WHERE au.email = ? AND au.is_active = true AND au.deleted_at IS NULL`,
    [email],
    (err, results) => {
      if (err) {
        console.error('[AUTH] DB Error:', err.code || err.name || 'UNKNOWN_ERROR');
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }
      
      if (results.length === 0) {
        console.log('[AUTH] User not found:', email);
        return res.status(401).json({
          success: false,
          message: 'Admin user not found',
          step: 'user_not_found'
        });
      }
      
      const user = results[0];
      console.log('[AUTH] User found, checking password...');
      
      bcrypt.compare(password, user.password_hash, (err, isValid) => {
        if (err) {
          console.error('[AUTH] Password compare error:', err);
          return res.status(500).json({
            success: false,
            message: 'Password verification failed'
          });
        }
        
        if (!isValid) {
          console.log('[AUTH] Invalid password for:', email);
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
            step: 'password_invalid'
          });
        }
        
        db.query(
          'UPDATE admin_users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?',
          [req.ip || 'unknown', user.id]
        );
        
        console.log('[AUTH] SUCCESS:', email);
        
        createAdminSession(user.id, 'admin').then((token) => {
          setSessionCookie(res, req, ADMIN_SESSION_COOKIE, token);
          res.json({
            success: true,
            message: 'Admin authentication successful',
            user: {
              id: user.id,
              email: user.email,
              name: user.display_name || `${user.first_name} ${user.last_name}`,
              admin_level: user.admin_level,
              role_type: 'admin',
              has_photo: !!user.has_photo,
              profile_image_id: user.profile_image_id || null,
            },
            token,
          });
        }).catch((sessionError) => {
          console.error('[AUTH] Admin session state initialization failed:', sessionError.message);
          res.status(500).json({ success: false, message: 'Admin session could not be started' });
        });
      });
    }
  );
});

router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1].trim() : getCookie(req, ADMIN_SESSION_COOKIE);

  try {
    if (token) await revokeAdminSession(token);
    clearSessionCookie(res, req, ADMIN_SESSION_COOKIE);
    return res.json({ success: true, message: 'This admin session has been logged out' });
  } catch (error) {
    console.error('[AUTH] Admin logout failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not log out this admin session' });
  }
});

// Get admin profile
router.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  
  db.query(
    'SELECT id, email, first_name, last_name, display_name, admin_level, department, profile_image_id, created_at FROM admin_users WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error('[PROFILE] Error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }
      
      res.json({ success: true, user: results[0] });
    }
  );
});

// Update admin profile
router.put('/profile/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, display_name, department, profile_image_id } = req.body;
  
  const updates = [];
  const values = [];
  
  if (first_name !== undefined) { updates.push('first_name = ?'); values.push(first_name); }
  if (last_name !== undefined) { updates.push('last_name = ?'); values.push(last_name); }
  if (display_name !== undefined) { updates.push('display_name = ?'); values.push(display_name); }
  if (department !== undefined) { updates.push('department = ?'); values.push(department); }
  if (profile_image_id !== undefined) { updates.push('profile_image_id = ?'); values.push(profile_image_id); }
  
  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }
  
  values.push(id);
  
  const query = `UPDATE admin_users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
  
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('[PROFILE UPDATE] Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    res.json({ success: true, message: 'Profile updated successfully' });
  });
});

// Upload admin profile photo
router.post('/profile/:id/photo', (req, res) => {
  const { id } = req.params;
  const { dataBase64, contentType, fileName } = req.body;
  
  if (!dataBase64) {
    return res.status(400).json({ success: false, message: 'Missing image data' });
  }
  
  let buffer;
  try {
    buffer = Buffer.from(dataBase64, 'base64');
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Invalid base64 image data' });
  }
  
  // Insert image into images table
  const imageQuery = `
    INSERT INTO images (owner_table, owner_id, purpose, filename, content_type, data)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(imageQuery, ['admin_users', id, 'profile_photo', fileName || 'profile.jpg', contentType || 'image/jpeg', buffer], (err, imageResult) => {
    if (err) {
      console.error('[PHOTO UPLOAD] Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to save photo' });
    }
    
    const imageId = imageResult.insertId;
    
    // Update admin profile with new image id
    db.query('UPDATE admin_users SET profile_image_id = ? WHERE id = ?', [imageId, id], (err) => {
      if (err) {
        console.error('[PHOTO UPDATE] Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update profile with photo' });
      }
      
      res.json({
        success: true,
        message: 'Profile photo updated successfully',
        image_id: imageId
      });
    });
  });
});

// AUTH PROTOCOL: Admin registration (admin_users only)
// The Developer platform was purged — a `role: "developer"` payload is
// rejected outright (see DEVELOPER_PURGE_NOTES.md).
router.post('/register', async (req, res) => {
  // NOTE: the admin-code second factor was purged (legacy — the admin auth
  // platform it guarded is unlisted). Signups are email+password only;
  // scripts/test-admin-code-guard.js fails if any admin-code check comes back.
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      role,
      admin_level,
      profile_image_id,
      profile_photo_base64,
      profile_photo_mime_type,
      profile_photo_file_name,
    } = req.body;
    
    const userRole = role || 'admin';
    if (userRole === 'developer') {
      return res.status(400).json({
        success: false,
        message: 'The developer role was retired; register as admin'
      });
    }
    const tableName = 'admin_users';
    
    console.log('[REGISTER] =========================================');
    console.log('[REGISTER] ROLE:', userRole);
    console.log('[REGISTER] TABLE:', tableName);
    console.log('[REGISTER] Data:', { email, first_name, last_name, profile_image_id });
    
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, first name and last name are required' 
      });
    }

    // auth_validation_rules seeds password_min_length = 8 for the 'admin'
    // platform (and 'user', enforced in backend/routes/users.js).
    // Both platforms share one policy: 8 characters minimum.
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    let profilePhotoBlob = null;
    let profilePhotoMimeType = null;
    let profilePhotoFileName = null;
    if (profile_photo_base64) {
      const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(profile_photo_base64);
      if (!match || match[1] !== profile_photo_mime_type) {
        return res.status(400).json({
          success: false,
          message: 'Profile photo must be a valid PNG, JPEG, or WebP image'
        });
      }

      profilePhotoBlob = Buffer.from(match[2], 'base64');
      if (!profilePhotoBlob.length || profilePhotoBlob.length > 5 * 1024 * 1024 || profilePhotoBlob.toString('base64') !== match[2]) {
        return res.status(400).json({
          success: false,
          message: 'Profile photo must be under 5MB and contain valid image data'
        });
      }

      profilePhotoMimeType = match[1];
      const matchesMime =
        profilePhotoMimeType === 'image/png'
          ? profilePhotoBlob.length >= 8 && profilePhotoBlob.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : profilePhotoMimeType === 'image/jpeg'
            ? profilePhotoBlob[0] === 0xff && profilePhotoBlob[1] === 0xd8 && profilePhotoBlob[2] === 0xff
            : profilePhotoBlob.length >= 12 &&
              profilePhotoBlob.toString('ascii', 0, 4) === 'RIFF' &&
              profilePhotoBlob.toString('ascii', 8, 12) === 'WEBP';
      if (!matchesMime) {
        return res.status(400).json({
          success: false,
          message: 'The selected file contents do not match its image format'
        });
      }
      profilePhotoFileName = String(profile_photo_file_name || 'profile.png')
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .slice(0, 255);
    }
    
    // Check if email exists in the admin table
    const [existing] = await db.promise().query(
      'SELECT id FROM admin_users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered as admin' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const displayName = `${first_name} ${last_name}`;
    
    let result;
    
    // Keep uploaded profile photos on the admin identity row as a BLOB.
    const level = admin_level || 'admin';
    [result] = await db.promise().query(
      `INSERT INTO admin_users (
         email, password_hash, first_name, last_name, display_name, admin_level,
         is_active, profile_image_id, profile_photo_blob, profile_photo_mime_type,
         profile_photo_file_name, created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, true, ?, ?, ?, ?, NOW())`,
      [
        email,
        hashedPassword,
        first_name,
        last_name,
        displayName,
        level,
        profile_image_id || null,
        profilePhotoBlob,
        profilePhotoMimeType,
        profilePhotoFileName,
      ]
    );
    
    console.log('[REGISTER] ✓ SUCCESS - Inserted into TABLE:', tableName, '| ID:', result.insertId);
    console.log('[REGISTER] =========================================');
    
    res.status(201).json({
      success: true,
      message: `${userRole} registered successfully`,
      userId: result.insertId,
      table: tableName,
      role: userRole,
      profile_image_id: profile_image_id || null
    });
    
  } catch (error) {
    console.error('[REGISTER] ERROR:', error.code || error.name || error.message, error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed'
    });
  }
});

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'admin-verification' });
});

module.exports = router;
