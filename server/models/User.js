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
  // Authentication & Verification
  email_verified: { type: Boolean, default: false },
  whatsapp_verified: { type: Boolean, default: false },
  whatsapp_auth_key: String,
  email_verification_token: String,
  email_verification_expires: Date,
  password_reset_token: String,
  password_reset_expires: Date,

  // Profile Details
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  display_name: String,
  phone_number: String,

  // Profile Photo (Direct Blob Storage)
  profile_photo: {
    data: Buffer,
    contentType: String,
    fileName: String
  },

  // Roles & Access
  primary_role: {
    type: String,
    enum: ['user', 'admin', 'developer'],
    default: 'user'
  },
  access_level: {
    type: String,
    enum: ['full', 'limited', 'read_only'],
    default: 'limited'
  },

  // Admin Specific
  admin_details: {
    level: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator']
    },
    permissions: mongoose.Schema.Types.Mixed, // Stores JSON
    department: String
  },

  // Developer Specific
  developer_details: {
    level: {
      type: String,
      enum: ['senior', 'mid', 'junior', 'lead']
    },
    tech_stack: mongoose.Schema.Types.Mixed, // Stores JSON
    specialization: String,
    team_id: Number,
    github_username: String,
    linkedin_url: String
  },

  // Security & Logging
  is_active: { type: Boolean, default: true },
  failed_login_attempts: { type: Number, default: 0 },
  account_locked_until: Date,
  two_factor_enabled: { type: Boolean, default: false },
  two_factor_secret: String,
  last_login_at: Date,
  last_login_ip: String,

  // Localization
  timezone: { type: String, default: 'UTC' },
  locale: { type: String, default: 'en-US' },

  // Legacy / SQL Integration IDs
  sql_id: Number,
  job_id: Number,

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deleted_at: Date,
  deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Password hashing middleware - Only hash if the string is NOT already a bcrypt hash
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();

  // Regex to detect bcrypt hashes: starts with $2a$, $2b$, or $2y$ followed by 56 or 60 chars
  const isBcrypt = /^\$2[aby]\$.{56,60}$/.test(this.password_hash);

  if (isBcrypt) {
    return next(); // Already hashed, skip
  }

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
