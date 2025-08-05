const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  prompt: {
    type: String,
    required: true,
    maxlength: 2000
  },
  promptLanguage: {
    type: String,
    enum: ['en', 'ar', 'auto'],
    default: 'auto'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appId: {
    type: String,
    required: true,
    unique: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  cssContent: {
    type: String,
    required: true
  },
  jsContent: {
    type: String,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  publicUrl: {
    type: String,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['business', 'education', 'entertainment', 'productivity', 'social', 'utility', 'other'],
    default: 'other'
  },
  generationTime: {
    type: Number, // in milliseconds
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastViewed: {
    type: Date,
    default: Date.now
  },
  // Feature-specific fields
  customDomain: {
    type: String,
    default: null
  },
  authConfig: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['basic', 'oauth', 'jwt'], default: 'basic' },
    providers: [{ type: String }]
  },
  databaseConfig: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['mongodb', 'mysql', 'postgresql'], default: 'mongodb' },
    collections: [{ type: String }]
  },
  shares: {
    type: Number,
    default: 0
  }
});

// Update the updatedAt field before saving
appSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate public URL when published
appSchema.methods.generatePublicUrl = function() {
  if (this.isPublished && this.isPublic) {
    this.publicUrl = `https://zentra.app/app/${this.appId}`;
  }
  return this.publicUrl;
};

// Increment view count
appSchema.methods.incrementViews = function() {
  this.views += 1;
  this.lastViewed = new Date();
  return this.save();
};

module.exports = mongoose.model('App', appSchema);