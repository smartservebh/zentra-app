const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  promptText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appType: {
    type: String,
    enum: ['web', 'mobile', 'desktop', 'api', 'fullstack', 'other'],
    default: 'web'
  },
  language: {
    type: String,
    enum: ['en', 'ar'],
    default: 'en'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  generatedAppId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    default: null
  },
  metadata: {
    wordCount: Number,
    estimatedComplexity: {
      type: String,
      enum: ['simple', 'moderate', 'complex'],
      default: 'moderate'
    },
    tags: [String],
    category: String
  },
  error: {
    message: String,
    code: String,
    timestamp: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
promptSchema.index({ userId: 1, createdAt: -1 });
promptSchema.index({ status: 1 });
promptSchema.index({ appType: 1 });

// Update timestamp on save
promptSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate word count
  if (this.promptText) {
    this.metadata = this.metadata || {};
    this.metadata.wordCount = this.promptText.split(/\s+/).length;
  }
  
  next();
});

// Virtual for time elapsed
promptSchema.virtual('timeElapsed').get(function() {
  return Date.now() - this.createdAt;
});

// Instance methods
promptSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  return this.save();
};

promptSchema.methods.markAsCompleted = function(appId) {
  this.status = 'completed';
  this.generatedAppId = appId;
  return this.save();
};

promptSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.error = {
    message: error.message,
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date()
  };
  return this.save();
};

// Static methods
promptSchema.statics.getUserPrompts = function(userId, options = {}) {
  const { page = 1, limit = 10, status, appType } = options;
  const query = { userId };
  
  if (status) query.status = status;
  if (appType) query.appType = appType;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('generatedAppId', 'title appId')
    .exec();
};

promptSchema.statics.getPromptStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        processing: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    processing: 0
  };
};

module.exports = mongoose.model('Prompt', promptSchema);