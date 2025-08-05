const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'improvement', 'complaint', 'praise', 'other'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    default: null
  },
  promptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'in-review', 'in-progress', 'resolved', 'closed', 'wont-fix'],
    default: 'new'
  },
  metadata: {
    browser: String,
    os: String,
    screenResolution: String,
    userAgent: String,
    url: String,
    errorStack: String
  },
  attachments: [{
    filename: String,
    url: String,
    mimeType: String,
    size: Number,
    uploadedAt: Date
  }],
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  rating: {
    satisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    wouldRecommend: Boolean
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
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
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ priority: 1, status: 1 });
feedbackSchema.index({ 'response.respondedBy': 1 });

// Update timestamp on save
feedbackSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for response time
feedbackSchema.virtual('responseTime').get(function() {
  if (this.response && this.response.respondedAt) {
    return this.response.respondedAt - this.createdAt;
  }
  return null;
});

// Instance methods
feedbackSchema.methods.updateStatus = function(status, userId = null) {
  this.status = status;
  if (status === 'resolved' && userId) {
    this.response = this.response || {};
    this.response.respondedBy = userId;
    this.response.respondedAt = new Date();
  }
  return this.save();
};

feedbackSchema.methods.addResponse = function(message, userId) {
  this.response = {
    message,
    respondedBy: userId,
    respondedAt: new Date()
  };
  this.status = 'in-review';
  return this.save();
};

feedbackSchema.methods.addAttachment = function(attachmentData) {
  this.attachments = this.attachments || [];
  this.attachments.push({
    ...attachmentData,
    uploadedAt: new Date()
  });
  return this.save();
};

// Static methods
feedbackSchema.statics.getUserFeedback = function(userId, options = {}) {
  const { page = 1, limit = 10, type, status } = options;
  const query = { userId };
  
  if (type) query.type = type;
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('appId', 'title appId')
    .populate('promptId', 'promptText')
    .populate('response.respondedBy', 'username')
    .exec();
};

feedbackSchema.statics.getFeedbackStats = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        avgResponseTime: [
          {
            $match: {
              'response.respondedAt': { $exists: true }
            }
          },
          {
            $project: {
              responseTime: {
                $subtract: ['$response.respondedAt', '$createdAt']
              }
            }
          },
          {
            $group: {
              _id: null,
              avgTime: { $avg: '$responseTime' }
            }
          }
        ],
        satisfaction: [
          {
            $match: {
              'rating.satisfaction': { $exists: true }
            }
          },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating.satisfaction' },
              totalRatings: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);
  
  return stats[0];
};

feedbackSchema.statics.getPublicFeedback = function(options = {}) {
  const { page = 1, limit = 10, type } = options;
  const query = { isPublic: true };
  
  if (type) query.type = type;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('userId', 'username')
    .select('-metadata -attachments')
    .exec();
};

module.exports = mongoose.model('Feedback', feedbackSchema);