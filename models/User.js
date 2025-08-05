const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'team'],
    default: 'free'
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'ar'],
    default: 'en'
  },
  appsCreated: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  planExpiry: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user can create more apps
userSchema.methods.canCreateApp = function() {
  const limits = {
    free: 3,
    pro: 50,
    team: Infinity
  };
  
  return this.appsCreated < limits[this.plan];
};

// Get remaining apps count
userSchema.methods.getRemainingApps = function() {
  const limits = {
    free: 3,
    pro: 50,
    team: Infinity
  };
  
  if (this.plan === 'team') return 'unlimited';
  return Math.max(0, limits[this.plan] - this.appsCreated);
};

module.exports = mongoose.model('User', userSchema);