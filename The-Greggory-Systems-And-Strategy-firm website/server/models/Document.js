const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['contract', 'proposal', 'report', 'invoice', 'deliverable', 'legal', 'technical', 'other'],
    required: true
  },
  category: String,
  description: String,
  file: {
    data: Buffer,
    contentType: String,
    fileName: String,
    size: Number,
    path: String // Optional: if storing on cloud like S3
  },
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'rejected', 'archived'],
    default: 'draft'
  },
  access_level: {
    type: String,
    enum: ['public', 'private', 'confidential'],
    default: 'private'
  },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  signatures: [{
    signer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'signed', 'declined'],
      default: 'pending'
    },
    signed_at: Date,
    ip_address: String
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Document', documentSchema);
