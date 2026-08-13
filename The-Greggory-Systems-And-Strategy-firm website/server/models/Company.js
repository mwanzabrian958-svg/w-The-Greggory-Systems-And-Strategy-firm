const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  industry: String,
  logo: {
    data: Buffer,
    contentType: String,
    fileName: String
  },
  website_url: String,
  contact_email: String,
  contact_phone: String,
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postal_code: String,
    country: String
  },
  is_active: { type: Boolean, default: true },
  sql_id: Number,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Company', companySchema);
