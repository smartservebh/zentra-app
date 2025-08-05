const User = require('../models/User');

// Feature access matrix
const featureMatrix = {
  free: [
    'app_creation',
    'code_editing',
    'basic_support'
  ],
  starter: [
    'app_creation',
    'code_editing',
    'custom_domains',
    'github_integration',
    'priority_support'
  ],
  builder: [
    'app_creation',
    'code_editing',
    'custom_domains',
    'github_integration',
    'analytics_dashboard',
    'authentication_system',
    'database_functionality',
    'priority_support'
  ],
  pro: [
    'app_creation',
    'code_editing',
    'custom_domains',
    'github_integration',
    'analytics_dashboard',
    'authentication_system',
    'database_functionality',
    'beta_features',
    'white_label',
    'dedicated_support',
    'custom_integrations'
  ]
};

// Check if user has access to a specific feature
const checkFeatureAccess = (userPlan, feature) => {
  const allowedFeatures = featureMatrix[userPlan] || [];
  return allowedFeatures.includes(feature);
};

// Middleware to check feature access
const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      // Get user from database
      const user = await User.findById(req.userId).select('plan');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user has access to the feature
      if (!checkFeatureAccess(user.plan, feature)) {
        return res.status(403).json({
          error: 'Feature not available',
          message: `This feature requires a higher plan. Your current plan: ${user.plan}`,
          requiredPlan: getRequiredPlan(feature),
          upgradeUrl: '/pricing'
        });
      }

      // User has access, continue
      req.userPlan = user.plan;
      next();
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({ error: 'Failed to check feature access' });
    }
  };
};

// Get the minimum required plan for a feature
const getRequiredPlan = (feature) => {
  for (const [plan, features] of Object.entries(featureMatrix)) {
    if (features.includes(feature)) {
      return plan;
    }
  }
  return 'pro'; // Default to pro if feature not found
};

// Middleware to attach user plan to request
const attachUserPlan = async (req, res, next) => {
  try {
    if (req.userId) {
      const user = await User.findById(req.userId).select('plan');
      if (user) {
        req.userPlan = user.plan;
        req.hasFeature = (feature) => checkFeatureAccess(user.plan, feature);
      }
    }
    next();
  } catch (error) {
    console.error('Attach user plan error:', error);
    next(); // Continue even if error
  }
};

// Get all features for a plan
const getPlanFeatures = (plan) => {
  return featureMatrix[plan] || [];
};

// Compare plans
const comparePlans = () => {
  return Object.entries(featureMatrix).map(([plan, features]) => ({
    plan,
    features
  }));
};

module.exports = {
  checkFeatureAccess,
  requireFeature,
  getRequiredPlan,
  attachUserPlan,
  getPlanFeatures,
  comparePlans,
  featureMatrix
};