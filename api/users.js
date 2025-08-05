const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const App = require('../models/App');

const router = express.Router();

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const apps = await App.find({ userId: req.userId });

    const stats = {
      totalApps: apps.length,
      publishedApps: apps.filter(app => app.isPublished).length,
      publicApps: apps.filter(app => app.isPublic).length,
      totalViews: apps.reduce((sum, app) => sum + app.views, 0),
      totalLikes: apps.reduce((sum, app) => sum + app.likes, 0),
      remainingApps: user.getRemainingApps(),
      plan: user.plan,
      memberSince: user.createdAt
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Update user plan
router.patch('/plan', auth, [
  body('plan').isIn(['free', 'pro', 'team']).withMessage('Invalid plan')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { plan } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.plan = plan;
    if (plan !== 'free') {
      // Set plan expiry to 1 month from now
      user.planExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else {
      user.planExpiry = null;
    }

    await user.save();

    res.json({
      message: 'Plan updated successfully',
      user: {
        id: user._id,
        plan: user.plan,
        planExpiry: user.planExpiry,
        remainingApps: user.getRemainingApps()
      }
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Change password
router.patch('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Delete account
router.delete('/account', auth, [
  body('password').notEmpty().withMessage('Password is required for account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { password } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Delete all user's apps
    const userApps = await App.find({ userId: req.userId });
    for (const app of userApps) {
      try {
        await appGenerator.deleteAppFiles(app.appId);
      } catch (error) {
        console.error(`Failed to delete files for app ${app.appId}:`, error);
      }
    }
    await App.deleteMany({ userId: req.userId });

    // Delete user account
    await User.deleteOne({ _id: req.userId });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;