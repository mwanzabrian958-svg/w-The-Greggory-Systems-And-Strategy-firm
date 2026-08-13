const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: mongoose.Schema.Types.Mixed,
  type: {
    type: String,
    enum: ['text', 'html', 'image', 'json', 'boolean', 'number'],
    default: 'text'
  },
  category: {
    type: String,
    default: 'general'
  },
  display_name: String,
  description: String,
  is_public: {
    type: Boolean,
    default: true
  },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('WebsiteContent', websiteContentSchema);
