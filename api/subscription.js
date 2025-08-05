const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Get available plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      credits: {
        messages: 25,
        integrations: 500
      },
      features: [
        'Unlimited app creation',
        'In-app code editing',
        'Community support',
        'Basic features'
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 19,
      credits: {
        messages: 100,
        integrations: 2000
      },
      features: [
        'Everything in Free',
        'Custom domains',
        'GitHub integration',
        'Priority support'
      ]
    },
    {
      id: 'builder',
      name: 'Builder',
      price: 49,
      credits: {
        messages: 250,
        integrations: 10000
      },
      features: [
        'Everything in Starter',
        'Analytics dashboard',
        'Authentication system',
        'Database functionality',
        'Advanced features'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      credits: {
        messages: 500,
        integrations: 20000
      },
      features: [
        'Everything in Builder',
        'Early access to beta features',
        'Dedicated support',
        'Custom integrations',
        'White-label options'
      ]
    }
  ];

  res.json({ plans });
});

// Get current subscription
router.get('/current', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('plan credits subscription');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      plan: user.plan,
      credits: user.credits,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Update subscription plan
router.post('/change-plan', auth, [
  body('plan')
    .isIn(['free', 'starter', 'builder', 'pro'])
    .withMessage('Invalid plan selected')
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

    const oldPlan = user.plan;
    
    // Don't allow changing to the same plan
    if (oldPlan === plan) {
      return res.status(400).json({ error: 'You are already on this plan' });
    }

    // Update user plan
    user.plan = plan;
    
    // Reset credits based on new plan
    const planCredits = {
      free: { messages: 25, integrations: 500 },
      starter: { messages: 100, integrations: 2000 },
      builder: { messages: 250, integrations: 10000 },
      pro: { messages: 500, integrations: 20000 }
    };

    user.credits = {
      messages: {
        used: 0,
        limit: planCredits[plan].messages
      },
      integrations: {
        used: 0,
        limit: planCredits[plan].integrations
      }
    };

    // Update subscription details
    user.subscription = {
      plan,
      status: plan === 'free' ? 'active' : 'trial', // In production, this would be based on payment
      startDate: new Date(),
      endDate: plan === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      autoRenew: plan !== 'free'
    };

    await user.save();

    // Send plan change email
    try {
      await emailService.sendPlanChangedEmail(user, oldPlan, plan, {
        proratedAmount: 0 // In production, calculate prorated amount
      });
      console.log('Plan change email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send plan change email:', emailError);
      // Don't fail the plan change if email fails
    }

    res.json({
      message: 'Plan updated successfully',
      plan: user.plan,
      credits: user.credits,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Change plan error:', error);
    res.status(500).json({ error: 'Failed to change plan' });
  }
});

// Cancel subscription (downgrade to free)
router.post('/cancel', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.plan === 'free') {
      return res.status(400).json({ error: 'You are already on the free plan' });
    }

    const oldPlan = user.plan;

    // Downgrade to free plan
    user.plan = 'free';
    user.credits = {
      messages: {
        used: 0,
        limit: 25
      },
      integrations: {
        used: 0,
        limit: 500
      }
    };

    user.subscription = {
      plan: 'free',
      status: 'active',
      startDate: new Date(),
      endDate: null,
      autoRenew: false
    };

    await user.save();

    // Send cancellation email
    try {
      await emailService.sendPlanChangedEmail(user, oldPlan, 'free', {});
      console.log('Cancellation email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({
      message: 'Subscription cancelled successfully',
      plan: user.plan,
      credits: user.credits
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Check feature access
router.get('/check-feature/:feature', auth, async (req, res) => {
  try {
    const { feature } = req.params;
    const user = await User.findById(req.userId).select('plan');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const featureAccess = {
      free: ['app_creation', 'code_editing'],
      starter: ['app_creation', 'code_editing', 'custom_domains', 'github_integration'],
      builder: ['app_creation', 'code_editing', 'custom_domains', 'github_integration', 
                'analytics', 'authentication', 'database'],
      pro: ['app_creation', 'code_editing', 'custom_domains', 'github_integration', 
            'analytics', 'authentication', 'database', 'beta_features', 'white_label']
    };

    const hasAccess = featureAccess[user.plan]?.includes(feature) || false;

    res.json({
      feature,
      hasAccess,
      userPlan: user.plan,
      requiredPlan: hasAccess ? user.plan : getRequiredPlan(feature)
    });
  } catch (error) {
    console.error('Check feature error:', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

// Helper function to get required plan for a feature
function getRequiredPlan(feature) {
  const featureMap = {
    'app_creation': 'free',
    'code_editing': 'free',
    'custom_domains': 'starter',
    'github_integration': 'starter',
    'analytics': 'builder',
    'authentication': 'builder',
    'database': 'builder',
    'beta_features': 'pro',
    'white_label': 'pro'
  };
  
  return featureMap[feature] || 'pro';
}

module.exports = router;