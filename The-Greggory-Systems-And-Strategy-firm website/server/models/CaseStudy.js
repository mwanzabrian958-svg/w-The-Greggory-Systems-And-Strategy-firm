const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema({
  title: { type: String, required: true },
  client: String,
  industry: String,
  challenge: String,
  solution: String,
  results: String,
  duration: String,
  images: [{
    url: String,
    data: Buffer,
    contentType: String
  }],
  is_featured: { type: Boolean, default: false },
  sql_id: Number
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('CaseStudy', caseStudySchema);
