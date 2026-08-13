const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transaction_id: { type: String, required: true, unique: true },
  invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Finance' },
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  merchant_request_id: String,
  checkout_request_id: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'KES' },
  phone_number: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'reversed'],
    default: 'pending'
  },
  result_code: Number,
  result_desc: String,
  transaction_date: { type: Date, default: Date.now },
  completion_time: Date,
  response_data: mongoose.Schema.Types.Mixed,
  payment_method: {
    type: String,
    enum: ['paybill', 'till_number', 'buy_goods'],
    default: 'paybill'
  },
  business_number: String,
  account_reference: String,
  client: {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String
  },
  reconciled: { type: Boolean, default: false },
  reconciled_at: Date,
  reconciled_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sql_id: Number,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Transaction', transactionSchema);
