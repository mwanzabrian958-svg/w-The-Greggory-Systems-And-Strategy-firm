const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const { sendSMS, sendBulkSMS, COMPANY_PHONE_NUMBER } = require('../services/smsService');

// Create connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'greggory_foundation_db_main',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'SMS router is working', companyPhone: COMPANY_PHONE_NUMBER });
});

// Send SMS FROM user TO company phone number
router.post('/send', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and message are required' 
      });
    }

    // Get user's phone number from database
    const [users] = await db.promise().query(
      'SELECT phone_number, first_name, last_name FROM users WHERE id = ? AND is_active = true',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = users[0];
    
    if (!user.phone_number) {
      return res.status(400).json({ 
        success: false, 
        message: 'You do not have a phone number registered. Please update your profile.' 
      });
    }

    // Send SMS FROM user TO company number
    const smsResult = await sendSMS(user.phone_number, message);
    
    if (smsResult.success) {
      // Log the SMS sent
      await db.promise().query(
        `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, affected_record_id, created_at)
         VALUES (?, 'SMS_SENT', ?, 'users', ?, NOW())`,
        [userId, `SMS sent FROM ${user.first_name} ${user.last_name} (${user.phone_number}) TO company (${COMPANY_PHONE_NUMBER})`, userId]
      );
      
      res.json({ 
        success: true, 
        message: 'Message sent successfully to company',
        from: user.phone_number,
        to: COMPANY_PHONE_NUMBER
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send message',
        error: smsResult.error
      });
    }
  } catch (error) {
    console.error('[SMS SEND] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending message',
      error: error.message
    });
  }
});

// Send SMS to multiple users (bulk)
router.post('/send-bulk', async (req, res) => {
  try {
    const { userIds, message } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'User IDs array and message are required' 
      });
    }

    // Get all users' phone numbers
    const [users] = await db.promise().query(
      `SELECT id, phone_number, first_name, last_name 
       FROM users 
       WHERE id IN (?) AND is_active = true AND phone_number IS NOT NULL`,
      [userIds]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No valid users found with phone numbers' 
      });
    }

    const phoneNumbers = users.map(user => user.phone_number);
    
    // Send bulk SMS
    const smsResult = await sendBulkSMS(phoneNumbers, message);
    
    if (smsResult.success) {
      // Log the bulk SMS sent
      await db.promise().query(
        `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, created_at)
         VALUES (?, 'BULK_SMS_SENT', ?, 'users', NOW())`,
        [userIds[0], `Bulk SMS sent to ${users.length} users: ${users.map(u => u.phone_number).join(', ')}`]
      );
      
      res.json({ 
        success: true, 
        message: 'Bulk SMS sent successfully',
        recipientsCount: users.length,
        recipients: phoneNumbers
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send bulk SMS',
        error: smsResult.error
      });
    }
  } catch (error) {
    console.error('[SMS BULK SEND] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending bulk SMS',
      error: error.message
    });
  }
});

// Send SMS to all active users with phone numbers
router.post('/send-all', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    // Get all active users with phone numbers
    const [users] = await db.promise().query(
      `SELECT id, phone_number, first_name, last_name 
       FROM users 
       WHERE is_active = true AND phone_number IS NOT NULL AND phone_number != ''`
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active users found with phone numbers' 
      });
    }

    const phoneNumbers = users.map(user => user.phone_number);
    
    // Send bulk SMS
    const smsResult = await sendBulkSMS(phoneNumbers, message);
    
    if (smsResult.success) {
      // Log the bulk SMS sent
      await db.promise().query(
        `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, created_at)
         VALUES (1, 'BULK_SMS_ALL', ?, 'users', NOW())`,
        [`Bulk SMS sent to all ${users.length} active users`]
      );
      
      res.json({ 
        success: true, 
        message: 'Bulk SMS sent to all active users successfully',
        recipientsCount: users.length
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send bulk SMS',
        error: smsResult.error
      });
    }
  } catch (error) {
    console.error('[SMS SEND ALL] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending bulk SMS to all users',
      error: error.message
    });
  }
});

module.exports = router;
