// Live Preview JavaScript

// Get app data from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const appId = urlParams.get('id') || generateRandomId();
const appName = urlParams.get('name') || 'My App';
const isPublished = urlParams.get('published') === 'true';

// Current language
let currentLanguage = localStorage.getItem('zentra_language') || 'en';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializePreview();
    updateLanguage();
});

function initializePreview() {
    // Set app info
    document.getElementById('appName').textContent = appName;
    document.getElementById('appId').textContent = appId;
    document.getElementById('appIdPreview').textContent = appId;
    
    // Set preview URL
    const domain = isPublished ? 'zentrahub.pro/app/' : 'zentrahub.pro/live/';
    document.getElementById('previewUrl').textContent = domain;
    
    // Update badge if published
    if (isPublished) {
        const badge = document.querySelector('.preview-badge');
        badge.textContent = currentLanguage === 'ar' ? 'من��ور' : 'Published';
        badge.style.background = '#d1fae5';
        badge.style.color = '#065f46';
    }
    
    // Load app content
    loadAppContent();
    
    // Set share URL
    const shareUrl = `https://zentrahub.pro/${isPublished ? 'app' : 'live'}/${appId}`;
    document.getElementById('shareUrl').value = shareUrl;
    
    // Set embed code
    const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`;
    document.getElementById('embedCode').value = embedCode;
}

function loadAppContent() {
    const frame = document.getElementById('appPreviewFrame');
    
    // In production, this would load from the server
    // For now, we'll load from the generated-apps directory
    const appUrl = `/generated-apps/${appId}/app.html`;
    
    // Check if we have app data in sessionStorage (from editor)
    const appData = sessionStorage.getItem('currentAppData');
    if (appData && !isPublished) {
        // Create blob URL for preview
        const blob = new Blob([appData], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        frame.src = url;
    } else {
        // Load from server
        frame.src = appUrl;
    }
    
    // Handle frame load errors
    frame.onerror = function() {
        frame.srcdoc = `
            <html>
                <body style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; color: #666;">
                    <div style="text-align: center;">
                        <h2>${currentLanguage === 'ar' ? 'التطبيق غير متاح' : 'App Not Available'}</h2>
                        <p>${currentLanguage === 'ar' ? 'لم يتم العثور على التطبيق أو أنه غير متاح حالياً' : 'App not found or currently unavailable'}</p>
                    </div>
                </body>
            </html>
        `;
    };
}

// Navigation Functions
function backToEditor() {
    // Check if we came from dashboard or editor
    const referrer = document.referrer;
    if (referrer.includes('dashboard')) {
        window.location.href = '/dashboard.html';
    } else {
        window.location.href = '/';
    }
}

// Share Functions
function shareApp() {
    document.getElementById('shareModal').classList.add('show');
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('show');
}

function copyUrl() {
    const url = `https://zentrahub.pro/${isPublished ? 'app' : 'live'}/${appId}`;
    copyToClipboard(url);
    showToast(currentLanguage === 'ar' ? 'تم نسخ الرابط!' : 'URL copied!');
}

function copyShareUrl() {
    const input = document.getElementById('shareUrl');
    input.select();
    document.execCommand('copy');
    showToast(currentLanguage === 'ar' ? 'تم نسخ الرابط!' : 'URL copied!');
}

function copyEmbedCode() {
    const textarea = document.getElementById('embedCode');
    textarea.select();
    document.execCommand('copy');
    showToast(currentLanguage === 'ar' ? 'تم نسخ كود التضمين!' : 'Embed code copied!');
}

function shareOnTwitter() {
    const text = currentLanguage === 'ar' 
        ? `شاهد تطبيقي الجديد الذي أنشأته باستخدام @ZentraApp!`
        : `Check out my new app created with @ZentraApp!`;
    const url = `https://zentrahub.pro/${isPublished ? 'app' : 'live'}/${appId}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareOnLinkedIn() {
    const url = `https://zentrahub.pro/${isPublished ? 'app' : 'live'}/${appId}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
}

function shareOnFacebook() {
    const url = `https://zentrahub.pro/${isPublished ? 'app' : 'live'}/${appId}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

// Publish Functions
function publishApp() {
    if (isPublished) {
        showToast(currentLanguage === 'ar' ? 'التطبيق منشور بالفعل!' : 'App is already published!');
        return;
    }
    document.getElementById('publishModal').classList.add('show');
}

function closePublishModal() {
    document.getElementById('publishModal').classList.remove('show');
}

function confirmPublish() {
    const publishType = document.querySelector('input[name="publishType"]:checked').value;
    const makePublic = document.getElementById('makePublic').checked;
    const enableAnalytics = document.getElementById('enableAnalytics').checked;
    
    // Show loading state
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Publishing...';
    btn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // In production, this would make an API call to publish the app
        closePublishModal();
        showToast(currentLanguage === 'ar' ? 'تم نشر التطبيق بنجاح!' : 'App published successfully!');
        
        // Reload page as published
        setTimeout(() => {
            window.location.href = `?id=${appId}&name=${encodeURIComponent(appName)}&published=true`;
        }, 1500);
    }, 2000);
}

// Export Functions
function exportCode() {
    document.getElementById('exportModal').classList.add('show');
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('show');
}

function exportAsZip() {
    // In production, this would trigger a download
    showToast(currentLanguage === 'ar' ? 'جاري تحضير ملف ZIP...' : 'Preparing ZIP file...');
    
    // Simulate download
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#';
        link.download = `${appId}.zip`;
        link.click();
        showToast(currentLanguage === 'ar' ? 'تم تحميل الملف!' : 'File downloaded!');
    }, 1500);
}

function exportToGithub() {
    // In production, this would open GitHub integration
    showToast(currentLanguage === 'ar' ? 'فتح تكامل GitHub...' : 'Opening GitHub integration...');
}

function viewCode() {
    // Redirect to code viewer
    window.location.href = `/code-viewer.html?id=${appId}`;
}

// Fullscreen Function
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.body.classList.add('fullscreen');
    } else {
        document.exitFullscreen();
        document.body.classList.remove('fullscreen');
    }
}

// Language Toggle
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('zentra_language', currentLanguage);
    updateLanguage();
}

function updateLanguage() {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    
    // Update language button text
    const langText = document.querySelector('.lang-text');
    if (langText) {
        langText.textContent = currentLanguage === 'en' ? 'العربية' : 'English';
    }
    
    // Update all translatable elements
    document.querySelectorAll('[data-en]').forEach(element => {
        const enText = element.getAttribute('data-en');
        const arText = element.getAttribute('data-ar');
        element.textContent = currentLanguage === 'en' ? enText : arText;
    });
    
    // Update placeholders
    document.querySelectorAll('[data-en-placeholder]').forEach(element => {
        const enPlaceholder = element.getAttribute('data-en-placeholder');
        const arPlaceholder = element.getAttribute('data-ar-placeholder');
        element.placeholder = currentLanguage === 'en' ? enPlaceholder : arPlaceholder;
    });
}

// Utility Functions
function generateRandomId() {
    return Math.random().toString(36).substring(2, 9);
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function showToast(message) {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Handle custom domain input
document.addEventListener('DOMContentLoaded', function() {
    const customDomainRadio = document.getElementById('customDomain');
    const customDomainInput = document.querySelector('.custom-domain-input');
    
    if (customDomainRadio && customDomainInput) {
        customDomainRadio.addEventListener('change', function() {
            if (this.checked) {
                customDomainInput.disabled = false;
                customDomainInput.focus();
            }
        });
        
        document.getElementById('zentraUrl').addEventListener('change', function() {
            if (this.checked) {
                customDomainInput.disabled = true;
            }
        });
    }
});

// Close modals on outside click
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
});

// Handle ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
            document.body.classList.remove('fullscreen');
        }
    }
});