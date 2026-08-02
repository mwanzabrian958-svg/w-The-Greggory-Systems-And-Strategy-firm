const db = require('../config/database');

/**
 * Creates a real notification in the database for a specific user.
 * @param {number} userId - The recipient user ID
 * @param {string} type - notification_type (e.g., 'project_update', 'task_assigned', 'system')
 * @param {string} title - The notification title
 * @param {string} message - The main notification body
 * @param {string} priority - 'low', 'normal', 'high', 'urgent'
 */
const createNotification = async (userId, type, title, message, priority = 'normal') => {
  try {
    if (!userId) return;

    await db.promise().query(
      'INSERT INTO notifications (user_id, notification_type, title, message, priority, status, created_at) VALUES (?, ?, ?, ?, ?, "unread", NOW())',
      [userId, type, title, message, priority]
    );
    console.log(`[REAL-LIFE NOTIF] Created for User ${userId}: ${title}`);
  } catch (error) {
    console.error('[REAL-LIFE NOTIF ERROR] Failed to create notification:', error);
  }
};

module.exports = { createNotification };
