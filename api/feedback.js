const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const emailService = require('../services/emailService');

const router = express.Router();

// Get user's feedback
router.get('/my-feedback', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    
    const feedback = await Feedback.getUserFeedback(req.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      status
    });
    
    const total = await Feedback.countDocuments({ userId: req.userId });
    
    res.json({
      feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get public feedback (testimonials)
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    
    const feedback = await Feedback.getPublicFeedback({
      page: parseInt(page),
      limit: parseInt(limit),
      type
    });
    
    const total = await Feedback.countDocuments({ isPublic: true });
    
    res.json({
      feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get public feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch public feedback' });
  }
});

// Get feedback statistics (admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const stats = await Feedback.getFeedbackStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get single feedback
router.get('/:feedbackId', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.feedbackId,
      userId: req.userId
    })
    .populate('appId', 'title appId')
    .populate('promptId', 'promptText')
    .populate('response.respondedBy', 'username');
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({ feedback });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Create new feedback
router.post('/create', auth, [
  body('type')
    .isIn(['bug', 'feature', 'improvement', 'complaint', 'praise', 'other'])
    .withMessage('Invalid feedback type'),
  body('subject')
    .isLength({ min: 3, max: 200 })
    .withMessage('Subject must be between 3 and 200 characters')
    .trim(),
  body('message')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('appId')
    .optional()
    .isMongoId()
    .withMessage('Invalid app ID'),
  body('promptId')
    .optional()
    .isMongoId()
    .withMessage('Invalid prompt ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const {
      type,
      subject,
      message,
      priority = 'medium',
      appId,
      promptId,
      metadata,
      isPublic = false
    } = req.body;
    
    // Create feedback
    const feedback = new Feedback({
      userId: req.userId,
      type,
      subject,
      message,
      priority,
      appId,
      promptId,
      metadata,
      isPublic
    });
    
    await feedback.save();
    
    // Send notification email to admin
    try {
      await emailService.sendEmail(
        process.env.ADMIN_EMAIL || 'admin@zentrahub.pro',
        `New ${type} feedback: ${subject}`,
        'feedback-notification',
        {
          type,
          subject,
          message,
          priority,
          userId: req.userId,
          feedbackId: feedback._id
        }
      );
    } catch (emailError) {
      console.error('Failed to send feedback notification:', emailError);
    }
    
    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        type: feedback.type,
        subject: feedback.subject,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });
    
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Update feedback
router.put('/:feedbackId', auth, [
  body('subject')
    .optional()
    .isLength({ min: 3, max: 200 })
    .trim(),
  body('message')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']),
  body('isPublic')
    .optional()
    .isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const feedback = await Feedback.findOne({
      _id: req.params.feedbackId,
      userId: req.userId
    });
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    // Only allow updates if feedback is not resolved/closed
    if (['resolved', 'closed'].includes(feedback.status)) {
      return res.status(400).json({ error: 'Cannot update resolved or closed feedback' });
    }
    
    const { subject, message, priority, isPublic } = req.body;
    
    if (subject) feedback.subject = subject;
    if (message) feedback.message = message;
    if (priority) feedback.priority = priority;
    if (typeof isPublic === 'boolean') feedback.isPublic = isPublic;
    
    await feedback.save();
    
    res.json({
      message: 'Feedback updated successfully',
      feedback
    });
    
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// Add rating to feedback
router.post('/:feedbackId/rate', auth, [
  body('satisfaction')
    .isInt({ min: 1, max: 5 })
    .withMessage('Satisfaction must be between 1 and 5'),
  body('wouldRecommend')
    .isBoolean()
    .withMessage('Would recommend must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const feedback = await Feedback.findOne({
      _id: req.params.feedbackId,
      userId: req.userId
    });
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    const { satisfaction, wouldRecommend } = req.body;
    
    feedback.rating = {
      satisfaction,
      wouldRecommend
    };
    
    await feedback.save();
    
    res.json({
      message: 'Rating added successfully',
      rating: feedback.rating
    });
    
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ error: 'Failed to add rating' });
  }
});

// Delete feedback
router.delete('/:feedbackId', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.feedbackId,
      userId: req.userId
    });
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    await feedback.remove();
    
    res.json({ message: 'Feedback deleted successfully' });
    
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// Admin endpoints

// Respond to feedback (admin only)
router.post('/:feedbackId/respond', auth, [
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Response must be between 1 and 1000 characters')
    .trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const feedback = await Feedback.findById(req.params.feedbackId)
      .populate('userId', 'email username');
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    const { message } = req.body;
    
    await feedback.addResponse(message, req.userId);
    
    // Send email to user
    try {
      await emailService.sendEmail(
        feedback.userId.email,
        `Response to your feedback: ${feedback.subject}`,
        'feedback-response',
        {
          username: feedback.userId.username,
          subject: feedback.subject,
          response: message,
          feedbackId: feedback._id
        }
      );
    } catch (emailError) {
      console.error('Failed to send response email:', emailError);
    }
    
    res.json({
      message: 'Response added successfully',
      feedback
    });
    
  } catch (error) {
    console.error('Respond to feedback error:', error);
    res.status(500).json({ error: 'Failed to respond to feedback' });
  }
});

// Update feedback status (admin only)
router.patch('/:feedbackId/status', auth, [
  body('status')
    .isIn(['new', 'in-review', 'in-progress', 'resolved', 'closed', 'wont-fix'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const feedback = await Feedback.findById(req.params.feedbackId);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    const { status } = req.body;
    
    await feedback.updateStatus(status, req.userId);
    
    res.json({
      message: 'Status updated successfully',
      feedback: {
        id: feedback._id,
        status: feedback.status
      }
    });
    
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;