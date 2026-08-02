const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'],
    default: 'not_started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  due_date: Date,
  completed_at: Date
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'pending', 'on_hold', 'cancelled'],
    default: 'active'
  },
  progress_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  start_date: {
    type: Date,
    required: true
  },
  expected_completion: {
    type: Date,
    required: true
  },
  actual_completion: Date,
  client: {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    contact: String
  },
  location: String,
  project_type: String,
  budget: {
    total: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  team: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'team_member' },
    assigned_at: { type: Date, default: Date.now }
  }],
  project_manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team_lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tasks: [taskSchema],
  activities: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['update', 'milestone', 'alert', 'note', 'status_change', 'team_change', 'photo_added', 'document_uploaded']
    },
    message: String,
    details: mongoose.Schema.Types.Mixed,
    created_at: { type: Date, default: Date.now }
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Project', projectSchema);
