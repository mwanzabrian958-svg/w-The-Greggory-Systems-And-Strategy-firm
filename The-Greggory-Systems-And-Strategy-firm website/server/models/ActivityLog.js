const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action_type: { type: String, required: true },
  action_description: String,
  affected_table: String,
  affected_record_id: String,
  old_values: mongoose.Schema.Types.Mixed,
  new_values: mongoose.Schema.Types.Mixed,
  ip_address: String,
  user_agent: String,
  sql_id: Number
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
