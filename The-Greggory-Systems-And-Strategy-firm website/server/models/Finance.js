const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  quantity: { type: Number, default: 1 },
  unit_price: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 }
});

const financeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['invoice', 'quote'],
    required: true
  },
  number: {
    type: String,
    required: true,
    unique: true
  },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  client: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    address: String
  },
  status: {
    type: String,
    default: 'draft'
  },
  items: [itemSchema],
  subtotal: Number,
  total_tax: Number,
  total_amount: Number,
  currency: { type: String, default: 'KES' },
  issue_date: { type: Date, default: Date.now },
  due_date: Date,
  paid_date: Date,
  payment_method: String,
  notes: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Finance', financeSchema);
