const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: String,
  body: {
    type: String,
    required: true
  },
  message_type: {
    type: String,
    enum: ['in_app', 'email', 'sms', 'whatsapp'],
    default: 'in_app'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'delivered', 'read'],
    default: 'sent'
  },
  attachments: [{
    fileName: String,
    fileType: String,
    data: Buffer
  }],
  read_at: Date
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Message', messageSchema);
