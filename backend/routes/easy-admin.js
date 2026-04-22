// Easy Admin Access Endpoint
// Simple admin access for development and testing

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// =============================================
// EASY ADMIN ACCESS
// Simple admin login with minimal validation
// =============================================
router.post('/easy-access', async (req, res) => {
  try {
    const { adminCode } = req.body;
    
    // Simple admin code validation
    if (adminCode === '***REMOVED***') {
      // Create admin user session
      const adminUser = {
        id: 1,
        email: 'admin@greggoryfoundation.com',
        name: 'System Administrator',
        primary_role: 'admin',
        job_title: 'Administrator',
        job_role: 'System Admin',
        admin_level: 'super_admin',
        access_level: 'full',
        department: 'System Administration'
      };
      
      // Log successful access
      console.log(`[EASY ADMIN] Admin access granted from IP: ${req.ip}`);
      
      res.json({
        success: true,
        message: 'Admin access granted successfully',
        user: adminUser,
        token: 'easy-admin-' + Date.now(),
        access_method: 'easy_access'
      });
    } else {
      res.status(403).json({
        success: false,
        message: 'Invalid admin code',
        hint: 'Use ***REMOVED*** for admin access'
      });
    }
  } catch (error) {
    console.error('Easy admin access error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin access'
    });
  }
});

// =============================================

// =============================================
// ADMIN STATUS CHECK
// Check if admin session is valid
// =============================================
router.get('/status', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Admin access endpoint is active',
      available_methods: [
        {
          endpoint: '/api/easy-admin/easy-access',
          method: 'POST',
          description: 'Easy admin access with code ***REMOVED***',
          required: { adminCode: '***REMOVED***' }
        },
        {
          endpoint: '/api/easy-admin/quick-access',
          method: 'POST',
          description: 'Quick admin access with code ***REMOVED*** or admin',
          required: { code: '***REMOVED*** or admin' }
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Status check failed'
    });
  }
});

module.exports = router;
