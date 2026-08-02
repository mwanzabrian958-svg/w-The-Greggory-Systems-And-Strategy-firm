const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  video_file: {
    data: Buffer,
    contentType: String,
    fileName: String,
    size: Number,
    url: String
  },
  thumbnail: {
    data: Buffer,
    contentType: String,
    fileName: String,
    url: String
  },
  is_active: { type: Boolean, default: true },
  is_featured: { type: Boolean, default: false },
  display_order: { type: Number, default: 0 },
  sql_id: Number,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Video', videoSchema);
