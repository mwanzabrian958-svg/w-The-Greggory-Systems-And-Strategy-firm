const mongoose = require('mongoose');

const blogArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: String,
  content: { type: String, required: true },
  author: String,
  read_time: String,
  category: String,
  featured_image: {
    data: Buffer,
    contentType: String,
    fileName: String,
    url: String
  },
  icon_class: String,
  is_published: { type: Boolean, default: false },
  published_date: Date,
  sql_id: Number
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('BlogArticle', blogArticleSchema);
