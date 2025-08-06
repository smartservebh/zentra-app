// Subscription Management JavaScript

// Plan details
const planDetails = {
    free: {
        name: 'Free',
        price: 0,
        credits: { messages: 25, integrations: 500 },
        features: ['app_creation', 'code_editing']
    },
    starter: {
        name: 'Starter',
        price: 19,
        credits: { messages: 100, integrations: 2000 },
        features: ['app_creation', 'code_editing', 'custom_domains', 'github_integration']
    },
    builder: {
        name: 'Builder',
        price: 49,
        credits: { messages: 250, integrations: 10000 },
        features: ['app_creation', 'code_editing', 'custom_domains', 'github_integration', 
                   'analytics_dashboard', 'authentication_system', 'database_functionality']
    },
    pro: {
        name: 'Pro',
        price: 99,
        credits: { messages: 500, integrations: 20000 },
        features: ['app_creation', 'code_editing', 'custom_domains', 'github_integration', 
                   'analytics_dashboard', 'authentication_system', 'database_functionality',
                   'beta_features', 'white_label', 'priority_support']
    }
};

// Feature names
const featureNames = {
    app_creation: { en: 'Unlimited App Creation', ar: 'إنشاء تطبيقات غير محدود' },
    code_editing: { en: 'In-App Code Editor', ar: 'محرر الكود داخل التطبيق' },
    custom_domains: { en: 'Custom Domains', ar: 'نطاقات مخصصة' },
    github_integration: { en: 'GitHub Integration', ar: 'تكامل GitHub' },
    analytics_dashboard: { en: 'Analytics Dashboard', ar: 'لوحة التحليلات' },
    authentication_system: { en: 'Authentication System', ar: 'نظام المصادقة' },
    database_functionality: { en: 'Database Functionality', ar: 'وظائف قاعدة البيانات' },
    beta_features: { en: 'Early Access to Beta Features', ar: 'الوصول المبكر للميزات التجريبية' },
    white_label: { en: 'White Label Options', ar: 'خيارات العلامة البيضاء' },
    priority_support: { en: 'Priority Support', ar: 'دعم الأولوية' }
};

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadSubscriptionData();
    setupEventListeners();
});

// Load subscription data
async function loadSubscriptionData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        // Get current subscription
        const response = await fetch('/api/subscription/current', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateSubscriptionUI(data);
        } else {
            console.error('Failed to load subscription data');
        }

        // Get user data for usage stats
        const userResponse = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (userResponse.ok) {
            const userData = await userResponse.json();
            updateUsageStats(userData.user);
        }

    } catch (error) {
        console.error('Error loading subscription data:', error);
    }
}

// Update subscription UI
function updateSubscriptionUI(data) {
    const { plan, credits, subscription } = data;
    
    // Update plan badge
    const planBadge = document.getElementById('currentPlanBadge');
    planBadge.textContent = planDetails[plan].name;
    planBadge.className = `plan-badge ${plan}`;
    
    // Update billing info
    if (plan !== 'free') {
        document.getElementById('billingCycle').textContent = 'Monthly';
        document.getElementById('nextBillingDate').textContent = 
            new Date(subscription.endDate).toLocaleDateString();
        document.getElementById('cancelBtn').style.display = 'block';
    }
    
    // Update usage stats
    updateCreditsDisplay(credits);
    
    // Update features list
    updateFeaturesList(plan);
    
    // Calculate reset date (first day of next month)
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    document.getElementById('resetDate').textContent = resetDate.toLocaleDateString();
}

// Update credits display
function updateCreditsDisplay(credits) {
    // Messages
    const messagesUsed = credits.messages.used;
    const messagesLimit = credits.messages.limit;
    document.getElementById('messagesUsed').textContent = messagesUsed;
    document.getElementById('messagesLimit').textContent = messagesLimit;
    document.getElementById('messagesProgress').style.width = 
        `${(messagesUsed / messagesLimit) * 100}%`;
    
    // Integrations
    const integrationsUsed = credits.integrations.used;
    const integrationsLimit = credits.integrations.limit;
    document.getElementById('integrationsUsed').textContent = integrationsUsed;
    document.getElementById('integrationsLimit').textContent = integrationsLimit;
    document.getElementById('integrationsProgress').style.width = 
        `${(integrationsUsed / integrationsLimit) * 100}%`;
}

// Update usage stats
function updateUsageStats(user) {
    document.getElementById('appsCreated').textContent = user.appsCreated || 0;
    // Storage calculation would be done server-side
    document.getElementById('storageUsed').textContent = '0 MB';
}

// Update features list
function updateFeaturesList(currentPlan) {
    const featuresList = document.getElementById('featuresList');
    featuresList.innerHTML = '';
    
    const allFeatures = Object.keys(featureNames);
    const currentFeatures = planDetails[currentPlan].features;
    
    allFeatures.forEach(feature => {
        const isEnabled = currentFeatures.includes(feature);
        const featureItem = document.createElement('div');
        featureItem.className = `feature-item ${isEnabled ? 'enabled' : 'disabled'}`;
        
        const lang = getCurrentLanguage();
        const featureName = featureNames[feature][lang];
        
        featureItem.innerHTML = `
            <span class="feature-icon ${isEnabled ? 'enabled' : 'disabled'}">
                ${isEnabled ? '✓' : '✗'}
            </span>
            <span class="feature-name">${featureName}</span>
        `;
        
        featuresList.appendChild(featureItem);
    });
}

// Setup event listeners
function setupEventListeners() {
    // User menu
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userMenuToggle) {
        userMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (userDropdown) {
            userDropdown.classList.remove('active');
        }
    });
}

// Show upgrade modal
function showUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    modal.classList.add('active');
    
    // Populate plans
    const plansGrid = modal.querySelector('.plans-grid');
    plansGrid.innerHTML = '';
    
    Object.entries(planDetails).forEach(([planId, plan]) => {
        if (planId === 'free') return; // Skip free plan in upgrade modal
        
        const planOption = document.createElement('div');
        planOption.className = 'plan-option';
        planOption.innerHTML = `
            <h3>${plan.name}</h3>
            <div class="price">$${plan.price}<span>/month</span></div>
            <div class="credits">
                ${plan.credits.messages} messages<br>
                ${plan.credits.integrations} integrations
            </div>
            <button class="btn btn-primary" onclick="upgradeToPlan('${planId}')">
                Choose ${plan.name}
            </button>
        `;
        
        plansGrid.appendChild(planOption);
    });
}

// Close upgrade modal
function closeUpgradeModal() {
    document.getElementById('upgradeModal').classList.remove('active');
}

// Show cancel modal
function showCancelModal() {
    document.getElementById('cancelModal').classList.add('active');
}

// Close cancel modal
function closeCancelModal() {
    document.getElementById('cancelModal').classList.remove('active');
}

// Upgrade to plan
async function upgradeToPlan(planId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/subscription/change-plan', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ plan: planId })
        });

        if (response.ok) {
            const data = await response.json();
            showNotification('Plan upgraded successfully!', 'success');
            closeUpgradeModal();
            // Reload page to show updated data
            setTimeout(() => location.reload(), 1500);
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to upgrade plan', 'error');
        }
    } catch (error) {
        console.error('Upgrade error:', error);
        showNotification('Failed to upgrade plan', 'error');
    }
}

// Cancel subscription
async function cancelSubscription() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/subscription/cancel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification('Subscription cancelled successfully', 'success');
            closeCancelModal();
            // Reload page to show updated data
            setTimeout(() => location.reload(), 1500);
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to cancel subscription', 'error');
        }
    } catch (error) {
        console.error('Cancel error:', error);
        showNotification('Failed to cancel subscription', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Get current language
function getCurrentLanguage() {
    return document.documentElement.getAttribute('lang') || 'en';
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}