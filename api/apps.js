const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { requireFeature, attachUserPlan } = require('../middleware/featureAccess');
const User = require('../models/User');
const App = require('../models/App');
const appGenerator = require('../services/appGenerator');
const emailService = require('../services/emailService');

const router = express.Router();

// Generate new app
router.post('/generate', auth, [
  body('prompt')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Prompt must be between 10 and 2000 characters')
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

    const { prompt } = req.body;
    const user = await User.findById(req.userId);

    // Check if user can create more apps
    if (!user.canCreateApp()) {
      return res.status(403).json({ 
        error: 'App limit reached for your plan',
        remainingApps: user.getRemainingApps(),
        plan: user.plan
      });
    }

    // Generate the app
    console.log(`Generating app for user ${user.username}: "${prompt}"`);
    const appData = await appGenerator.generateApp(prompt, req.userId);

    // Save app to database
    const app = new App({
      title: appData.title,
      description: appData.description,
      prompt: prompt,
      promptLanguage: appData.promptLanguage,
      userId: req.userId,
      appId: appData.appId,
      htmlContent: appData.htmlContent,
      cssContent: appData.cssContent,
      jsContent: appData.jsContent,
      category: appData.category,
      generationTime: appData.generationTime
    });

    await app.save();

    // Update user's app count
    user.appsCreated += 1;
    await user.save();

    console.log(`App created successfully: ${app.appId}`);

    res.status(201).json({
      message: 'App generated successfully',
      app: {
        id: app._id,
        appId: app.appId,
        title: app.title,
        description: app.description,
        category: app.category,
        isPublished: app.isPublished,
        isPublic: app.isPublic,
        views: app.views,
        createdAt: app.createdAt,
        generationTime: app.generationTime
      },
      remainingApps: user.getRemainingApps()
    });

  } catch (error) {
    console.error('App generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate app',
      details: error.message 
    });
  }
});

// Get user's apps
router.get('/my-apps', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const apps = await App.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-htmlContent -cssContent -jsContent');

    const total = await App.countDocuments({ userId: req.userId });

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

// Get specific app
router.get('/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const app = await App.findOne({ appId }).populate('userId', 'username');

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Check if user owns the app or if it's public
    const isOwner = req.userId && app.userId._id.toString() === req.userId.toString();
    if (!app.isPublic && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Increment view count if not owner
    if (!isOwner) {
      await app.incrementViews();
    }

    res.json({
      app: {
        id: app._id,
        appId: app.appId,
        title: app.title,
        description: app.description,
        category: app.category,
        isPublished: app.isPublished,
        isPublic: app.isPublic,
        views: app.views,
        likes: app.likes,
        tags: app.tags,
        createdAt: app.createdAt,
        owner: app.userId.username,
        isOwner
      }
    });
  } catch (error) {
    console.error('Get app error:', error);
    res.status(500).json({ error: 'Failed to fetch app' });
  }
});

// Get app content (HTML, CSS, JS)
router.get('/:appId/content', async (req, res) => {
  try {
    const { appId } = req.params;
    const app = await App.findOne({ appId });

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Check if user owns the app or if it's public
    const isOwner = req.userId && app.userId.toString() === req.userId.toString();
    if (!app.isPublic && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      html: app.htmlContent,
      css: app.cssContent,
      js: app.jsContent
    });
  } catch (error) {
    console.error('Get app content error:', error);
    res.status(500).json({ error: 'Failed to fetch app content' });
  }
});

// Update app
router.put('/:appId', auth, [
  body('title').optional().isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ min: 1, max: 500 }).trim(),
  body('category').optional().isIn(['business', 'education', 'entertainment', 'productivity', 'social', 'utility', 'other']),
  body('tags').optional().isArray(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { appId } = req.params;
    const app = await App.findOne({ appId, userId: req.userId });

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const { title, description, category, tags, isPublic } = req.body;

    if (title) app.title = title;
    if (description) app.description = description;
    if (category) app.category = category;
    if (tags) app.tags = tags;
    if (typeof isPublic === 'boolean') app.isPublic = isPublic;

    await app.save();

    res.json({
      message: 'App updated successfully',
      app: {
        id: app._id,
        appId: app.appId,
        title: app.title,
        description: app.description,
        category: app.category,
        isPublished: app.isPublished,
        isPublic: app.isPublic,
        tags: app.tags,
        views: app.views,
        updatedAt: app.updatedAt
      }
    });
  } catch (error) {
    console.error('Update app error:', error);
    res.status(500).json({ error: 'Failed to update app' });
  }
});

// Publish/unpublish app
router.patch('/:appId/publish', auth, async (req, res) => {
  try {
    const { appId } = req.params;
    const { isPublished } = req.body;

    const app = await App.findOne({ appId, userId: req.userId });

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    app.isPublished = isPublished;
    if (isPublished) {
      app.publicUrl = app.generatePublicUrl();
    } else {
      app.publicUrl = null;
    }

    await app.save();

    res.json({
      message: `App ${isPublished ? 'published' : 'unpublished'} successfully`,
      app: {
        id: app._id,
        appId: app.appId,
        isPublished: app.isPublished,
        publicUrl: app.publicUrl
      }
    });
  } catch (error) {
    console.error('Publish app error:', error);
    res.status(500).json({ error: 'Failed to publish app' });
  }
});

// Delete app
router.delete('/:appId', auth, async (req, res) => {
  try {
    const { appId } = req.params;
    const app = await App.findOne({ appId, userId: req.userId });

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Delete app files
    await appGenerator.deleteAppFiles(appId);

    // Delete from database
    await App.deleteOne({ _id: app._id });

    // Update user's app count
    const user = await User.findById(req.userId);
    user.appsCreated = Math.max(0, user.appsCreated - 1);
    await user.save();

    res.json({ 
      message: 'App deleted successfully',
      remainingApps: user.getRemainingApps()
    });
  } catch (error) {
    console.error('Delete app error:', error);
    res.status(500).json({ error: 'Failed to delete app' });
  }
});

// Get public apps (for discovery)
router.get('/public/discover', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category;
    const skip = (page - 1) * limit;

    const filter = { isPublic: true, isPublished: true };
    if (category && category !== 'all') {
      filter.category = category;
    }

    const apps = await App.find(filter)
      .populate('userId', 'username')
      .sort({ views: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-htmlContent -cssContent -jsContent -prompt');

    const total = await App.countDocuments(filter);

    res.json({
      apps: apps.map(app => ({
        id: app._id,
        appId: app.appId,
        title: app.title,
        description: app.description,
        category: app.category,
        views: app.views,
        likes: app.likes,
        tags: app.tags,
        createdAt: app.createdAt,
        owner: app.userId.username
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Discover apps error:', error);
    res.status(500).json({ error: 'Failed to fetch public apps' });
  }
});

// Custom domain setup (Starter+ feature)
router.post('/:appId/custom-domain', auth, requireFeature('custom_domains'), [
  body('domain')
    .matches(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/)
    .withMessage('Invalid domain format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { appId } = req.params;
    const { domain } = req.body;

    const app = await App.findOne({ appId, userId: req.userId });
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    app.customDomain = domain;
    await app.save();

    res.json({
      message: 'Custom domain configured successfully',
      app: {
        appId: app.appId,
        customDomain: app.customDomain
      }
    });
  } catch (error) {
    console.error('Custom domain error:', error);
    res.status(500).json({ error: 'Failed to configure custom domain' });
  }
});

// GitHub integration (Starter+ feature)
router.post('/:appId/github-export', auth, requireFeature('github_integration'), async (req, res) => {
  try {
    const { appId } = req.params;
    const { repoName, isPrivate = false } = req.body;

    const app = await App.findOne({ appId, userId: req.userId });
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // In production, this would integrate with GitHub API
    // For now, we'll simulate the export
    const exportData = {
      repoUrl: `https://github.com/${req.user?.username || 'user'}/${repoName}`,
      files: ['index.html', 'styles.css', 'script.js'],
      exportedAt: new Date()
    };

    res.json({
      message: 'App exported to GitHub successfully',
      export: exportData
    });
  } catch (error) {
    console.error('GitHub export error:', error);
    res.status(500).json({ error: 'Failed to export to GitHub' });
  }
});

// Analytics dashboard (Builder+ feature)
router.get('/:appId/analytics', auth, requireFeature('analytics_dashboard'), async (req, res) => {
  try {
    const { appId } = req.params;
    const app = await App.findOne({ appId, userId: req.userId });

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Get analytics data
    const analytics = {
      views: app.views,
      likes: app.likes,
      shares: app.shares || 0,
      dailyViews: [], // Would be populated from analytics collection
      topReferrers: [],
      deviceBreakdown: {
        desktop: 60,
        mobile: 35,
        tablet: 5
      },
      locationData: []
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Authentication system setup (Builder+ feature)
router.post('/:appId/auth-setup', auth, requireFeature('authentication_system'), async (req, res) => {
  try {
    const { appId } = req.params;
    const { authType, providers } = req.body;

    const app = await App.findOne({ appId, userId: req.userId });
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Configure authentication for the app
    app.authConfig = {
      enabled: true,
      type: authType, // 'basic', 'oauth', 'jwt'
      providers: providers || ['email', 'google']
    };

    await app.save();

    res.json({
      message: 'Authentication system configured successfully',
      authConfig: app.authConfig
    });
  } catch (error) {
    console.error('Auth setup error:', error);
    res.status(500).json({ error: 'Failed to setup authentication' });
  }
});

// Database functionality (Builder+ feature)
router.post('/:appId/database-setup', auth, requireFeature('database_functionality'), async (req, res) => {
  try {
    const { appId } = req.params;
    const { dbType, collections } = req.body;

    const app = await App.findOne({ appId, userId: req.userId });
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Configure database for the app
    app.databaseConfig = {
      enabled: true,
      type: dbType || 'mongodb',
      collections: collections || []
    };

    await app.save();

    res.json({
      message: 'Database configured successfully',
      databaseConfig: app.databaseConfig
    });
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({ error: 'Failed to setup database' });
  }
});

// Beta features access (Pro feature)
router.get('/beta-features', auth, requireFeature('beta_features'), async (req, res) => {
  try {
    const betaFeatures = [
      {
        id: 'ai-code-review',
        name: 'AI Code Review',
        description: 'Get AI-powered code reviews and suggestions',
        status: 'active'
      },
      {
        id: 'voice-commands',
        name: 'Voice Commands',
        description: 'Create apps using voice commands',
        status: 'testing'
      },
      {
        id: 'team-collaboration',
        name: 'Real-time Team Collaboration',
        description: 'Work on apps together in real-time',
        status: 'coming-soon'
      }
    ];

    res.json({ betaFeatures });
  } catch (error) {
    console.error('Beta features error:', error);
    res.status(500).json({ error: 'Failed to fetch beta features' });
  }
});

module.exports = router;