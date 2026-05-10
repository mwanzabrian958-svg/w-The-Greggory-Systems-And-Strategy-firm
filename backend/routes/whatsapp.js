const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const { sendWhatsAppMessage, sendBulkWhatsApp, COMPANY_WHATSAPP_NUMBER } = require('../services/whatsappService');

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
  res.json({ success: true, message: 'WhatsApp router is working', companyPhone: COMPANY_WHATSAPP_NUMBER });
});

// Send WhatsApp message FROM user TO company WhatsApp number
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

    // Send WhatsApp message FROM user TO company number
    const whatsappResult = await sendWhatsAppMessage(user.phone_number, message);
    
    if (whatsappResult.success) {
      // Log the WhatsApp message sent
      await db.promise().query(
        `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, affected_record_id, created_at)
         VALUES (?, 'WHATSAPP_SENT', ?, 'users', ?, NOW())`,
        [userId, `WhatsApp sent FROM ${user.first_name} ${user.last_name} (${user.phone_number}) TO company (${COMPANY_WHATSAPP_NUMBER})`, userId]
      );
      
      res.json({ 
        success: true, 
        message: 'WhatsApp message sent successfully to company',
        from: user.phone_number,
        to: COMPANY_WHATSAPP_NUMBER
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send WhatsApp message',
        error: whatsappResult.error
      });
    }
  } catch (error) {
    console.error('[WHATSAPP SEND] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending WhatsApp message',
      error: error.message
    });
  }
});

// Send WhatsApp message to multiple users (bulk - admin function)
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
    
    // Send bulk WhatsApp
    const whatsappResult = await sendBulkWhatsApp(phoneNumbers, message);
    
    if (whatsappResult.success) {
      // Log the bulk WhatsApp sent
      await db.promise().query(
        `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, created_at)
         VALUES (?, 'BULK_WHATSAPP_SENT', ?, 'users', NOW())`,
        [userIds[0], `Bulk WhatsApp sent to ${users.length} users: ${users.map(u => u.phone_number).join(', ')}`]
      );
      
      res.json({ 
        success: true, 
        message: 'Bulk WhatsApp sent successfully',
        recipientsCount: users.length,
        recipients: phoneNumbers
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send bulk WhatsApp',
        error: whatsappResult.error
      });
    }
  } catch (error) {
    console.error('[WHATSAPP BULK SEND] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending bulk WhatsApp',
      error: error.message
    });
  }
});

module.exports = router;
