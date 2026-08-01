const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  display_name: String,
  phone_number: String,
  profile_photo: {
    data: Buffer,
    contentType: String,
    fileName: String
  },
  primary_role: {
    type: String,
    enum: ['user', 'admin', 'developer'],
    default: 'user'
  },
  admin_details: {
    level: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator']
    },
    permissions: [String],
    department: String
  },
  developer_details: {
    level: {
      type: String,
      enum: ['senior', 'mid', 'junior', 'lead']
    },
    tech_stack: [String],
    specialization: String,
    github_username: String,
    linkedin_url: String
  },
  is_active: {
    type: Boolean,
    default: true
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  last_login_at: Date,
  last_login_ip: String,
  timezone: {
    type: String,
    default: 'UTC'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);
