/**
 * AUTH PROTOCOL - DEVELOPER ONLY
 * This file MUST ONLY reference the `developer_users` table.
 * NEVER query users or admin_users tables from this file.
 * See AUTH_PROTOCOL.md for full specification.
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Developer Authentication - LOGIN
router.post('/authenticate', (req, res) => {
  console.log('[DEV AUTH] Login attempt:', req.body.email);
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
  
  // STRICT PROTOCOL: Only query developer_users table with profile photo
  db.query(
    `SELECT du.*, i.data as profile_photo_blob, i.content_type as profile_photo_type 
     FROM developer_users du 
     LEFT JOIN images i ON i.id = du.profile_image_id
     WHERE du.email = ? AND du.is_active = true AND du.deleted_at IS NULL`,
    [email],
    (err, results) => {
      if (err) {
        console.error('[DEV AUTH] DB Error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (results.length === 0) {
        console.log('[DEV AUTH] Developer not found:', email);
        return res.status(401).json({
          success: false,
          message: 'Developer user not found',
          step: 'user_not_found'
        });
      }
      
      const user = results[0];
      console.log('[DEV AUTH] Developer found, checking password...');
      
      bcrypt.compare(password, user.password_hash, (err, isValid) => {
        if (err) {
          console.error('[DEV AUTH] Password compare error:', err);
          return res.status(500).json({
            success: false,
            message: 'Password verification failed'
          });
        }
        
        if (!isValid) {
          console.log('[DEV AUTH] Invalid password for:', email);
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
            step: 'password_invalid'
          });
        }
        
        // Update last login
        db.query(
          'UPDATE developer_users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?',
          [req.ip || 'unknown', user.id]
        );
        
        console.log('[DEV AUTH] SUCCESS:', email);
        
        // Convert blob to base64 data URI
        let profilePhotoData = null;
        if (user.profile_photo_blob) {
          const base64 = Buffer.from(user.profile_photo_blob).toString('base64');
          const mimeType = user.profile_photo_type || 'image/jpeg';
          profilePhotoData = `data:${mimeType};base64,${base64}`;
        }
        
        res.json({
          success: true,
          message: 'Developer authentication successful',
          user: {
            id: user.id,
            email: user.email,
            name: user.display_name || `${user.first_name} ${user.last_name}`,
            developer_level: user.developer_level,
            role_type: 'developer',
            profilePhotoData: profilePhotoData,
            profile_image_id: user.profile_image_id
          },
          token: `developer-session-${Date.now()}-${user.id}`
        });
      });
    }
  );
});

// Get developer profile
router.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  
  // STRICT PROTOCOL: Only query developer_users table
  db.query(
    'SELECT id, email, first_name, last_name, display_name, developer_level, department, profile_image_id, created_at FROM developer_users WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error('[DEV PROFILE] Error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Developer not found' });
      }
      
      res.json({ success: true, user: results[0] });
    }
  );
});

// Update developer profile
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
  
  const query = `UPDATE developer_users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
  
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('[DEV PROFILE UPDATE] Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Developer not found' });
    }
    
    res.json({ success: true, message: 'Profile updated successfully' });
  });
});

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'developer-verification' });
});

module.exports = router;
