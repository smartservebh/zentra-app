// Dashboard JavaScript

let currentUser = null;
let currentGeneratedApp = null;
let currentFilter = 'all';
let currentPage = 1;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    // Check authentication
    const token = localStorage.getItem('zentra_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Get user data
        const userData = await zentra.apiRequest('/api/auth/me');
        currentUser = userData.user;
        
        // Update UI with user data
        updateUserUI();
        
        // Load dashboard data
        await loadDashboardData();
        
        // Initialize event listeners
        initializeEventListeners();
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        localStorage.removeItem('zentra_token');
        window.location.href = 'login.html';
    }
}

function updateUserUI() {
    if (!currentUser) return;
    
    // Update user avatar and name
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (userAvatar) {
        userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
    }
    
    if (userName) {
        userName.textContent = currentUser.username;
    }
    
    // Update profile form
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const preferredLanguage = document.getElementById('preferredLanguage');
    
    if (profileUsername) profileUsername.value = currentUser.username;
    if (profileEmail) profileEmail.value = currentUser.email;
    if (preferredLanguage) preferredLanguage.value = currentUser.preferredLanguage;
    
    // Update plan info
    const currentPlan = document.getElementById('currentPlan');
    const planAppsInfo = document.getElementById('planAppsInfo');
    
    if (currentPlan) {
        currentPlan.textContent = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);
    }
    
    if (planAppsInfo) {
        const remaining = currentUser.remainingApps;
        planAppsInfo.textContent = remaining === 'unlimited' 
            ? (currentLanguage === 'ar' ? 'تطبيقات غير محدودة' : 'Unlimited apps')
            : `${remaining} ${currentLanguage === 'ar' ? 'تطبيق متبقي' : 'apps remaining'}`;
    }
}

async function loadDashboardData() {
    try {
        // Load user stats
        const statsData = await zentra.apiRequest('/api/users/stats');
        updateStatsUI(statsData.stats);
        
        // Load recent apps
        const appsData = await zentra.apiRequest('/api/apps/my-apps?limit=6');
        updateRecentAppsUI(appsData.apps);
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        zentra.showAlert(
            currentLanguage === 'ar' 
                ? 'فشل في تحميل بيانات لوحة التحكم'
                : 'Failed to load dashboard data',
            'error'
        );
    }
}

function updateStatsUI(stats) {
    const totalApps = document.getElementById('totalApps');
    const totalViews = document.getElementById('totalViews');
    const publishedApps = document.getElementById('publishedApps');
    const remainingApps = document.getElementById('remainingApps');
    
    if (totalApps) totalApps.textContent = zentra.formatNumber(stats.totalApps);
    if (totalViews) totalViews.textContent = zentra.formatNumber(stats.totalViews);
    if (publishedApps) publishedApps.textContent = zentra.formatNumber(stats.publishedApps);
    if (remainingApps) {
        remainingApps.textContent = stats.remainingApps === 'unlimited' 
            ? '∞' 
            : zentra.formatNumber(stats.remainingApps);
    }
}

function updateRecentAppsUI(apps) {
    const recentAppsGrid = document.getElementById('recentAppsGrid');
    if (!recentAppsGrid) return;
    
    if (apps.length === 0) {
        recentAppsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📱</div>
                <h3 data-en="No apps yet" data-ar="لا توجد تطبيقات بعد">No apps yet</h3>
                <p data-en="Create your first app to get started" data-ar="أنشئ تطبيقك الأول للبدء">Create your first app to get started</p>
                <button class="btn btn-primary" onclick="showSection('create')" data-en="Create App" data-ar="إنشاء تطبيق">Create App</button>
            </div>
        `;
        zentra.updateTranslations();
        return;
    }
    
    recentAppsGrid.innerHTML = apps.map(app => createAppCard(app)).join('');
    zentra.updateTranslations();
}

function createAppCard(app) {
    const createdDate = zentra.formatDate(app.createdAt);
    
    return `
        <div class="app-card" onclick="viewApp('${app.appId}')">
            <div class="app-preview-img">
                <span>${app.title.charAt(0).toUpperCase()}</span>
            </div>
            <div class="app-card-content">
                <div class="app-card-header">
                    <div>
                        <h3 class="app-title">${app.title}</h3>
                        <span class="app-category">${app.category}</span>
                    </div>
                </div>
                <p class="app-description">${app.description}</p>
                <div class="app-stats">
                    <div class="app-stat">
                        <span>👁️</span>
                        <span>${zentra.formatNumber(app.views)}</span>
                    </div>
                    <div class="app-stat">
                        <span>📅</span>
                        <span>${createdDate}</span>
                    </div>
                    ${app.isPublished ? '<div class="app-stat"><span>🚀</span><span data-en="Published" data-ar="منشور">Published</span></div>' : ''}
                </div>
                <div class="app-actions">
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); editApp('${app.appId}')" data-en="Edit" data-ar="تعديل">Edit</button>
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); viewApp('${app.appId}')" data-en="View" data-ar="عرض">View</button>
                </div>
            </div>
        </div>
    `;
}

// Section Management
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update sidebar menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    const activeMenuItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
    
    // Load section-specific data
    switch (sectionName) {
        case 'apps':
            loadMyApps();
            break;
        case 'discover':
            loadDiscoverApps();
            break;
        case 'create':
            initializeCreateForm();
            break;
    }
}

// My Apps Section
async function loadMyApps(page = 1, filter = 'all') {
    try {
        const myAppsGrid = document.getElementById('myAppsGrid');
        if (!myAppsGrid) return;
        
        // Show loading
        myAppsGrid.innerHTML = '<div class="loading">Loading apps...</div>';
        
        let url = `/api/apps/my-apps?page=${page}&limit=12`;
        if (filter !== 'all') {
            url += `&filter=${filter}`;
        }
        
        const response = await zentra.apiRequest(url);
        
        if (response.apps.length === 0) {
            myAppsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📱</div>
                    <h3 data-en="No apps found" data-ar="لم يتم العثور على تطبيقات">No apps found</h3>
                    <p data-en="Create your first app to get started" data-ar="أنشئ تطبيقك الأول للبدء">Create your first app to get started</p>
                    <button class="btn btn-primary" onclick="showSection('create')" data-en="Create App" data-ar="إنشاء تطبيق">Create App</button>
                </div>
            `;
        } else {
            myAppsGrid.innerHTML = response.apps.map(app => createAppCard(app)).join('');
        }
        
        // Update pagination
        updatePagination('appsPagination', response.pagination, (page) => loadMyApps(page, filter));
        
        zentra.updateTranslations();
        
    } catch (error) {
        console.error('Failed to load apps:', error);
        const myAppsGrid = document.getElementById('myAppsGrid');
        if (myAppsGrid) {
            myAppsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <h3 data-en="Failed to load apps" data-ar="فشل في تحميل التطبيقات">Failed to load apps</h3>
                    <button class="btn btn-primary" onclick="loadMyApps()" data-en="Try Again" data-ar="حاول مرة أخرى">Try Again</button>
                </div>
            `;
        }
    }
}

function filterApps(filter) {
    currentFilter = filter;
    currentPage = 1;
    
    // Update filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => tab.classList.remove('active'));
    
    const activeTab = document.querySelector(`[onclick="filterApps('${filter}')"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    loadMyApps(1, filter);
}

// Create App Section
function initializeCreateForm() {
    const appPrompt = document.getElementById('appPrompt');
    const generateBtn = document.getElementById('generateAppBtn');
    
    if (appPrompt && generateBtn) {
        appPrompt.addEventListener('input', function() {
            const hasText = this.value.trim().length >= 10;
            generateBtn.disabled = !hasText;
        });
    }
}

function fillAppPrompt(suggestionElement) {
    const appPrompt = document.getElementById('appPrompt');
    const generateBtn = document.getElementById('generateAppBtn');
    
    if (appPrompt) {
        const text = suggestionElement.getAttribute(`data-${currentLanguage}`) || suggestionElement.textContent;
        appPrompt.value = `Create a ${text.toLowerCase()} with modern design and responsive layout`;
        appPrompt.focus();
        
        if (generateBtn) {
            generateBtn.disabled = false;
        }
    }
}

async function generateNewApp() {
    const appPrompt = document.getElementById('appPrompt');
    const generateBtn = document.getElementById('generateAppBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoading = generateBtn.querySelector('.btn-loading');
    const appPreview = document.getElementById('appPreview');
    
    const prompt = appPrompt.value.trim();
    
    if (prompt.length < 10) {
        zentra.showAlert(
            currentLanguage === 'ar' 
                ? 'يرجى إدخال وصف أكثر تفصيلاً (10 أحرف على الأقل)'
                : 'Please enter a more detailed description (at least 10 characters)',
            'warning'
        );
        return;
    }
    
    try {
        // Show loading state
        generateBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        // Hide previous preview
        if (appPreview) {
            appPreview.style.display = 'none';
        }
        
        // Generate app
        const response = await zentra.apiRequest('/api/apps/generate', {
            method: 'POST',
            body: JSON.stringify({ prompt })
        });
        
        currentGeneratedApp = response.app;
        
        // Show success message
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'تم إنشاء تطبيقك بنجاح!'
                : 'Your app has been generated successfully!',
            'success'
        );
        
        // Show preview
        showAppPreview(response.app.appId);
        
        // Update stats
        await loadDashboardData();
        
    } catch (error) {
        console.error('App generation error:', error);
        
        let errorMessage = currentLanguage === 'ar'
            ? 'فشل في إنشاء التطبيق. يرجى المحاولة مرة أخرى.'
            : 'Failed to generate app. Please try again.';
            
        if (error.message.includes('limit reached')) {
            errorMessage = currentLanguage === 'ar'
                ? 'لقد وصلت إلى الحد الأقصى لعدد التطبيقات في خطتك'
                : 'You have reached the app limit for your plan';
        }
        
        zentra.showAlert(errorMessage, 'error');
        
    } finally {
        // Reset button state
        generateBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

function showAppPreview(appId) {
    const appPreview = document.getElementById('appPreview');
    const previewFrame = document.getElementById('previewFrame');
    
    if (appPreview && previewFrame) {
        previewFrame.src = `/generated-apps/${appId}/app.html`;
        appPreview.style.display = 'block';
        appPreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function editGeneratedApp() {
    if (!currentGeneratedApp) return;
    
    zentra.showAlert(
        currentLanguage === 'ar'
            ? 'ميزة التحرير قريباً'
            : 'Edit feature coming soon',
        'info'
    );
}

function saveGeneratedApp() {
    if (!currentGeneratedApp) return;
    
    zentra.showAlert(
        currentLanguage === 'ar'
            ? 'تم حفظ التطبيق بنجاح!'
            : 'App saved successfully!',
        'success'
    );
    
    // Refresh the apps list
    if (document.getElementById('apps-section').classList.contains('active')) {
        loadMyApps();
    }
    
    // Clear the form
    const appPrompt = document.getElementById('appPrompt');
    const appPreview = document.getElementById('appPreview');
    const generateBtn = document.getElementById('generateAppBtn');
    
    if (appPrompt) appPrompt.value = '';
    if (appPreview) appPreview.style.display = 'none';
    if (generateBtn) generateBtn.disabled = true;
    
    currentGeneratedApp = null;
}

// Discover Apps Section
async function loadDiscoverApps(category = 'all', page = 1) {
    try {
        const discoverAppsGrid = document.getElementById('discoverAppsGrid');
        if (!discoverAppsGrid) return;
        
        // Show loading
        discoverAppsGrid.innerHTML = '<div class="loading">Loading apps...</div>';
        
        let url = `/api/apps/public/discover?page=${page}&limit=12`;
        if (category !== 'all') {
            url += `&category=${category}`;
        }
        
        const response = await zentra.apiRequest(url);
        
        if (response.apps.length === 0) {
            discoverAppsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3 data-en="No apps found" data-ar="لم يتم العثور على تطبيقات">No apps found</h3>
                    <p data-en="Be the first to publish an app in this category" data-ar="كن أول من ينشر تطبيقاً في هذه الفئة">Be the first to publish an app in this category</p>
                </div>
            `;
        } else {
            discoverAppsGrid.innerHTML = response.apps.map(app => createDiscoverAppCard(app)).join('');
        }
        
        zentra.updateTranslations();
        
    } catch (error) {
        console.error('Failed to load discover apps:', error);
    }
}

function createDiscoverAppCard(app) {
    return `
        <div class="app-card" onclick="viewPublicApp('${app.appId}')">
            <div class="app-preview-img">
                <span>${app.title.charAt(0).toUpperCase()}</span>
            </div>
            <div class="app-card-content">
                <div class="app-card-header">
                    <div>
                        <h3 class="app-title">${app.title}</h3>
                        <span class="app-category">${app.category}</span>
                    </div>
                </div>
                <p class="app-description">${app.description}</p>
                <div class="app-stats">
                    <div class="app-stat">
                        <span>👁️</span>
                        <span>${zentra.formatNumber(app.views)}</span>
                    </div>
                    <div class="app-stat">
                        <span>👤</span>
                        <span>${app.owner}</span>
                    </div>
                    <div class="app-stat">
                        <span>⭐</span>
                        <span>${zentra.formatNumber(app.likes)}</span>
                    </div>
                </div>
                <div class="app-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); viewPublicApp('${app.appId}')" data-en="View App" data-ar="عرض التطبيق">View App</button>
                </div>
            </div>
        </div>
    `;
}

function filterDiscoverApps(category) {
    // Update category buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`[onclick="filterDiscoverApps('${category}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    loadDiscoverApps(category);
}

// App Actions
async function viewApp(appId) {
    try {
        const response = await zentra.apiRequest(`/api/apps/${appId}`);
        showAppModal(response.app, true);
    } catch (error) {
        console.error('Failed to load app:', error);
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'فشل في تحميل التطبيق'
                : 'Failed to load app',
            'error'
        );
    }
}

async function viewPublicApp(appId) {
    try {
        const response = await zentra.apiRequest(`/api/apps/${appId}`);
        showAppModal(response.app, false);
    } catch (error) {
        console.error('Failed to load app:', error);
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'فشل في تحميل التطبيق'
                : 'Failed to load app',
            'error'
        );
    }
}

function editApp(appId) {
    zentra.showAlert(
        currentLanguage === 'ar'
            ? 'ميزة التحرير قريباً'
            : 'Edit feature coming soon',
        'info'
    );
}

function showAppModal(app, isOwner) {
    const modal = document.getElementById('appModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = app.title;
    
    modalBody.innerHTML = `
        <div class="app-modal-content">
            <div class="app-modal-header">
                <h4>${app.title}</h4>
                <span class="app-category">${app.category}</span>
            </div>
            <p class="app-description">${app.description}</p>
            <div class="app-stats">
                <div class="app-stat">
                    <span>👁️</span>
                    <span>${zentra.formatNumber(app.views)} views</span>
                </div>
                ${app.likes !== undefined ? `
                <div class="app-stat">
                    <span>⭐</span>
                    <span>${zentra.formatNumber(app.likes)} likes</span>
                </div>
                ` : ''}
                ${app.owner ? `
                <div class="app-stat">
                    <span>👤</span>
                    <span>by ${app.owner}</span>
                </div>
                ` : ''}
            </div>
            <div class="app-modal-actions">
                <button class="btn btn-primary" onclick="openAppInNewTab('${app.appId}')" data-en="Open App" data-ar="فتح التطبيق">Open App</button>
                ${isOwner ? `
                <button class="btn btn-outline" onclick="editApp('${app.appId}')" data-en="Edit" data-ar="تعديل">Edit</button>
                <button class="btn btn-error" onclick="deleteApp('${app.appId}')" data-en="Delete" data-ar="حذف">Delete</button>
                ` : ''}
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    zentra.updateTranslations();
}

function openAppInNewTab(appId) {
    window.open(`/generated-apps/${appId}/app.html`, '_blank');
}

async function deleteApp(appId) {
    if (!confirm(currentLanguage === 'ar' ? 'هل أنت متأكد من حذف هذا التطبيق؟' : 'Are you sure you want to delete this app?')) {
        return;
    }
    
    try {
        await zentra.apiRequest(`/api/apps/${appId}`, {
            method: 'DELETE'
        });
        
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'تم حذف التطبيق بنجاح'
                : 'App deleted successfully',
            'success'
        );
        
        closeModal('appModal');
        
        // Refresh the current view
        if (document.getElementById('apps-section').classList.contains('active')) {
            loadMyApps();
        }
        
        // Update stats
        await loadDashboardData();
        
    } catch (error) {
        console.error('Failed to delete app:', error);
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'فشل في حذف التطبيق'
                : 'Failed to delete app',
            'error'
        );
    }
}

// Event Listeners
function initializeEventListeners() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // Apps search
    const appsSearch = document.getElementById('appsSearch');
    if (appsSearch) {
        appsSearch.addEventListener('input', zentra.debounce(handleAppsSearch, 300));
    }
    
    // App prompt input
    const appPrompt = document.getElementById('appPrompt');
    if (appPrompt) {
        appPrompt.addEventListener('input', function() {
            const generateBtn = document.getElementById('generateAppBtn');
            if (generateBtn) {
                generateBtn.disabled = this.value.trim().length < 10;
            }
        });
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
}

// Form Handlers
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const preferredLanguage = formData.get('preferredLanguage');
    
    try {
        const response = await zentra.apiRequest('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify({ username, preferredLanguage })
        });
        
        currentUser = response.user;
        updateUserUI();
        
        // Update language if changed
        if (preferredLanguage !== currentLanguage) {
            zentra.setLanguage(preferredLanguage);
        }
        
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'تم تحديث الملف الشخصي بنجاح'
                : 'Profile updated successfully',
            'success'
        );
        
    } catch (error) {
        console.error('Profile update error:', error);
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'فشل في تحديث الملف الشخصي'
                : 'Failed to update profile',
            'error'
        );
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmNewPassword = formData.get('confirmNewPassword');
    
    if (newPassword !== confirmNewPassword) {
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'كلمات المرور الجديدة غير متطابقة'
                : 'New passwords do not match',
            'error'
        );
        return;
    }
    
    try {
        await zentra.apiRequest('/api/users/password', {
            method: 'PATCH',
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'تم تغيير كلمة المرور بنجاح'
                : 'Password changed successfully',
            'success'
        );
        
        // Clear form
        e.target.reset();
        
    } catch (error) {
        console.error('Password change error:', error);
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'فشل في تغيير كلمة المرور'
                : 'Failed to change password',
            'error'
        );
    }
}

function handleAppsSearch(e) {
    const query = e.target.value.trim();
    // Implement search functionality
    console.log('Searching for:', query);
}

// UI Helpers
function updatePagination(containerId, pagination, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container || !pagination) return;
    
    const { page, pages, total } = pagination;
    
    if (pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button ${page <= 1 ? 'disabled' : ''} onclick="${onPageChange.name}(${page - 1})">
            <span data-en="Previous" data-ar="السابق">Previous</span>
        </button>
    `;
    
    // Page numbers
    for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
        paginationHTML += `
            <button class="${i === page ? 'active' : ''}" onclick="${onPageChange.name}(${i})">
                ${i}
            </button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button ${page >= pages ? 'disabled' : ''} onclick="${onPageChange.name}(${page + 1})">
            <span data-en="Next" data-ar="التالي">Next</span>
        </button>
    `;
    
    container.innerHTML = paginationHTML;
    zentra.updateTranslations();
}

// Modal Management
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// User Menu
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Mobile Menu
function toggleMobileMenu() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

// Settings Actions
function showProfile() {
    showSection('settings');
    toggleUserMenu();
}

function showSettings() {
    showSection('settings');
    toggleUserMenu();
}

async function deleteAccount() {
    const password = prompt(currentLanguage === 'ar' ? 'أدخل كلمة المرور لتأكيد حذف الحساب:' : 'Enter your password to confirm account deletion:');
    
    if (!password) return;
    
    if (!confirm(currentLanguage === 'ar' ? 'هل أنت متأكد؟ هذا الإجراء لا يمكن التراجع عنه.' : 'Are you sure? This action cannot be undone.')) {
        return;
    }
    
    try {
        await zentra.apiRequest('/api/users/account', {
            method: 'DELETE',
            body: JSON.stringify({ password })
        });
        
        localStorage.removeItem('zentra_token');
        localStorage.removeItem('zentra_user');
        
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'تم حذف الحساب بنجاح'
                : 'Account deleted successfully',
            'success'
        );
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Account deletion error:', error);
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'فشل في حذف الحساب'
                : 'Failed to delete account',
            'error'
        );
    }
}

async function logout() {
    try {
        const token = localStorage.getItem('zentra_token');
        if (token) {
            await zentra.apiRequest('/api/auth/logout', {
                method: 'POST'
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('zentra_token');
        localStorage.removeItem('zentra_user');
        window.location.href = 'index.html';
    }
}

// Initialize default section
document.addEventListener('DOMContentLoaded', function() {
    // Show overview section by default
    setTimeout(() => {
        showSection('overview');
    }, 100);
});