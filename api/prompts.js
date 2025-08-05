const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Prompt = require('../models/Prompt');
const App = require('../models/App');
const User = require('../models/User');
const appGenerator = require('../services/appGenerator');

const router = express.Router();

// Get user's prompts
router.get('/my-prompts', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, appType } = req.query;
    
    const prompts = await Prompt.getUserPrompts(req.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      appType
    });
    
    const total = await Prompt.countDocuments({ userId: req.userId });
    
    res.json({
      prompts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// Get prompt statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Prompt.getPromptStats(req.userId);
    res.json({ stats });
  } catch (error) {
    console.error('Get prompt stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get single prompt
router.get('/:promptId', auth, async (req, res) => {
  try {
    const prompt = await Prompt.findOne({
      _id: req.params.promptId,
      userId: req.userId
    }).populate('generatedAppId');
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    res.json({ prompt });
  } catch (error) {
    console.error('Get prompt error:', error);
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

// Create new prompt and generate app
router.post('/create', auth, [
  body('promptText')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Prompt must be between 10 and 5000 characters')
    .trim(),
  body('appType')
    .optional()
    .isIn(['web', 'mobile', 'desktop', 'api', 'fullstack', 'other'])
    .withMessage('Invalid app type'),
  body('language')
    .optional()
    .isIn(['en', 'ar'])
    .withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { promptText, appType = 'web', language = 'en' } = req.body;
    
    // Check user's app limit
    const user = await User.findById(req.userId);
    if (!user.canCreateApp()) {
      return res.status(403).json({ 
        error: 'App limit reached for your plan',
        remainingApps: user.getRemainingApps(),
        plan: user.plan
      });
    }
    
    // Create prompt record
    const prompt = new Prompt({
      promptText,
      userId: req.userId,
      appType,
      language,
      status: 'pending'
    });
    
    await prompt.save();
    
    // Start app generation in background
    generateAppFromPrompt(prompt, user);
    
    res.status(201).json({
      message: 'Prompt received and processing started',
      prompt: {
        id: prompt._id,
        status: prompt.status,
        createdAt: prompt.createdAt
      }
    });
    
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// Update prompt
router.put('/:promptId', auth, [
  body('promptText')
    .optional()
    .isLength({ min: 10, max: 5000 })
    .trim(),
  body('appType')
    .optional()
    .isIn(['web', 'mobile', 'desktop', 'api', 'fullstack', 'other']),
  body('tags')
    .optional()
    .isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const prompt = await Prompt.findOne({
      _id: req.params.promptId,
      userId: req.userId
    });
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    // Only allow updates if prompt is not processing
    if (prompt.status === 'processing') {
      return res.status(400).json({ error: 'Cannot update prompt while processing' });
    }
    
    const { promptText, appType, tags } = req.body;
    
    if (promptText) prompt.promptText = promptText;
    if (appType) prompt.appType = appType;
    if (tags) {
      prompt.metadata = prompt.metadata || {};
      prompt.metadata.tags = tags;
    }
    
    await prompt.save();
    
    res.json({
      message: 'Prompt updated successfully',
      prompt
    });
    
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// Delete prompt
router.delete('/:promptId', auth, async (req, res) => {
  try {
    const prompt = await Prompt.findOne({
      _id: req.params.promptId,
      userId: req.userId
    });
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    // Delete associated app if exists
    if (prompt.generatedAppId) {
      await App.findByIdAndDelete(prompt.generatedAppId);
    }
    
    await prompt.remove();
    
    res.json({ message: 'Prompt deleted successfully' });
    
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// Retry failed prompt
router.post('/:promptId/retry', auth, async (req, res) => {
  try {
    const prompt = await Prompt.findOne({
      _id: req.params.promptId,
      userId: req.userId
    });
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    if (prompt.status !== 'failed') {
      return res.status(400).json({ error: 'Can only retry failed prompts' });
    }
    
    // Check user's app limit
    const user = await User.findById(req.userId);
    if (!user.canCreateApp()) {
      return res.status(403).json({ 
        error: 'App limit reached for your plan',
        remainingApps: user.getRemainingApps(),
        plan: user.plan
      });
    }
    
    // Reset prompt status
    prompt.status = 'pending';
    prompt.error = undefined;
    await prompt.save();
    
    // Retry app generation
    generateAppFromPrompt(prompt, user);
    
    res.json({
      message: 'Prompt retry started',
      prompt: {
        id: prompt._id,
        status: prompt.status
      }
    });
    
  } catch (error) {
    console.error('Retry prompt error:', error);
    res.status(500).json({ error: 'Failed to retry prompt' });
  }
});

// Helper function to generate app from prompt
async function generateAppFromPrompt(prompt, user) {
  try {
    // Mark as processing
    await prompt.markAsProcessing();
    
    // Generate the app
    console.log(`Generating app from prompt ${prompt._id}: "${prompt.promptText}"`);
    const appData = await appGenerator.generateApp(prompt.promptText, user._id);
    
    // Save app to database
    const app = new App({
      title: appData.title,
      description: appData.description,
      prompt: prompt.promptText,
      promptLanguage: prompt.language,
      userId: user._id,
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
    
    // Mark prompt as completed
    await prompt.markAsCompleted(app._id);
    
    console.log(`App generated successfully from prompt ${prompt._id}`);
    
  } catch (error) {
    console.error(`Failed to generate app from prompt ${prompt._id}:`, error);
    await prompt.markAsFailed(error);
  }
}

module.exports = router;