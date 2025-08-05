const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const App = require('../models/App');

const router = express.Router();

// Get admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalApps = await App.countDocuments();
    const publishedApps = await App.countDocuments({ isPublished: true });
    const publicApps = await App.countDocuments({ isPublic: true });
    
    const planStats = await User.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);

    const categoryStats = await App.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email plan createdAt');

    const recentApps = await App.find()
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category views isPublished createdAt userId');

    res.json({
      stats: {
        totalUsers,
        totalApps,
        publishedApps,
        publicApps,
        planStats,
        categoryStats
      },
      recentUsers,
      recentApps
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all apps
router.get('/apps', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const apps = await App.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-htmlContent -cssContent -jsContent');

    const total = await App.countDocuments();

    res.json({
      apps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get apps error:', error);
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
});

// Update user
router.patch('/users/:userId', adminAuth, [
  body('plan').optional().isIn(['free', 'pro', 'team']),
  body('isActive').optional().isBoolean(),
  body('isAdmin').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { userId } = req.params;
    const { plan, isActive, isAdmin } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (plan) user.plan = plan;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        plan: user.plan,
        isActive: user.isActive,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting yourself
    if (userId === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all user's apps
    const userApps = await App.find({ userId });
    for (const app of userApps) {
      try {
        await appGenerator.deleteAppFiles(app.appId);
      } catch (error) {
        console.error(`Failed to delete files for app ${app.appId}:`, error);
      }
    }
    await App.deleteMany({ userId });

    // Delete user
    await User.deleteOne({ _id: userId });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete app
router.delete('/apps/:appId', adminAuth, async (req, res) => {
  try {
    const { appId } = req.params;

    const app = await App.findOne({ appId });
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Delete app files
    await appGenerator.deleteAppFiles(appId);

    // Delete from database
    await App.deleteOne({ _id: app._id });

    // Update user's app count
    const user = await User.findById(app.userId);
    if (user) {
      user.appsCreated = Math.max(0, user.appsCreated - 1);
      await user.save();
    }

    res.json({ message: 'App deleted successfully' });
  } catch (error) {
    console.error('Delete app error:', error);
    res.status(500).json({ error: 'Failed to delete app' });
  }
});

module.exports = router;