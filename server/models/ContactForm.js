const mongoose = require('mongoose');

const contactFormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  company: String,
  subject: String,
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  sql_id: Number
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('ContactForm', contactFormSchema);
