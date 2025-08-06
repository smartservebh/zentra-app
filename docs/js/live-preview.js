// Live Preview JavaScript - Enhanced

let currentLanguage = 'en';
let previewTimer;
let timeRemaining = 3600; // 1 hour in seconds
let isFullscreen = false;

// Initialize preview
document.addEventListener('DOMContentLoaded', function() {
    initializePreview();
    startExpiryTimer();
    initializeLanguage();
    initializeCookieConsent();
    setupKeyboardShortcuts();
});

function initializePreview() {
    // Get app data from URL or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const appId = urlParams.get('id') || 'demo';
    
    // Update preview ID in URL bar
    document.getElementById('previewId').textContent = appId;
    
    // Load app content
    loadAppPreview(appId);
    
    // Set up share URL
    const shareUrl = `${window.location.origin}/preview/${appId}`;
    document.getElementById('shareUrl').value = shareUrl;
    
    // Set up embed code
    const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`;
    document.getElementById('embedCode').value = embedCode;
}

function loadAppPreview(appId) {
    const frame = document.getElementById('appPreviewFrame');
    const container = document.querySelector('.preview-container');
    
    // Show loading state
    container.innerHTML = `
        <div class="preview-loading">
            <div class="spinner" style="width: 40px; height: 40px; border-width: 4px;"></div>
            <p>Loading preview...</p>
        </div>
    `;
    
    // Try to get app data from sessionStorage first
    const appData = sessionStorage.getItem('currentAppData');
    if (appData) {
        const blob = new Blob([appData], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Create new iframe
        const newFrame = document.createElement('iframe');
        newFrame.id = 'appPreviewFrame';
        newFrame.src = url;
        newFrame.frameBorder = '0';
        newFrame.allowFullscreen = true;
        
        newFrame.onload = function() {
            container.innerHTML = '';
            container.appendChild(newFrame);
            console.log('App preview loaded successfully');
        };
        
        newFrame.onerror = function() {
            showPreviewError();
        };
    } else {
        // Create demo app
        const demoApp = createDemoApp();
        const blob = new Blob([demoApp], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const newFrame = document.createElement('iframe');
        newFrame.id = 'appPreviewFrame';
        newFrame.src = url;
        newFrame.frameBorder = '0';
        newFrame.allowFullscreen = true;
        
        newFrame.onload = function() {
            container.innerHTML = '';
            container.appendChild(newFrame);
        };
    }
}

function createDemoApp() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo App - Zentra</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
        h1 { color: #333; margin-bottom: 20px; font-size: 2rem; }
        p { color: #666; margin-bottom: 30px; line-height: 1.6; }
        .btn { background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; transition: all 0.3s; }
        .btn:hover { background: #059669; transform: translateY(-2px); }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-top: 30px; }
        .feature { padding: 20px; background: #f8f9fa; border-radius: 10px; }
        .feature-icon { font-size: 2rem; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Demo App</h1>
        <p>This is a demo application created with Zentra. You can describe any app idea and our AI will generate it instantly!</p>
        <button class="btn" onclick="alert('This is a demo app created with Zentra!')">Try Demo</button>
        <div class="features">
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <h3>Fast</h3>
                <p>Generated in seconds</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🎨</div>
                <h3>Beautiful</h3>
                <p>Modern design</p>
            </div>
            <div class="feature">
                <div class="feature-icon">📱</div>
                <h3>Responsive</h3>
                <p>Works everywhere</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function showPreviewError() {
    const container = document.querySelector('.preview-container');
    container.innerHTML = `
        <div class="preview-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Failed to Load Preview</h3>
            <p>There was an error loading the app preview. Please try again.</p>
            <button class="retry-btn" onclick="retryPreview()">Retry</button>
        </div>
    `;
}

function retryPreview() {
    const appId = document.getElementById('previewId').textContent;
    loadAppPreview(appId);
}

function startExpiryTimer() {
    previewTimer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(previewTimer);
            showExpiryNotice();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timeRemaining').textContent = display;
}

function showExpiryNotice() {
    const notice = document.querySelector('.preview-notice');
    notice.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Preview expired. Please generate a new preview.</span>
    `;
    notice.style.background = '#fee2e2';
    notice.style.borderColor = '#fecaca';
    notice.style.color = '#991b1b';
}

// Navigation functions
function backToEditor() {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.href = '/dashboard.html';
    }
}

// App actions
function publishApp() {
    const appId = document.getElementById('previewId').textContent;
    
    if (confirm(currentLanguage === 'ar' ? 'هل تريد نشر هذا التطبيق؟' : 'Do you want to publish this app?')) {
        // Show loading state
        const btn = event.target.closest('.btn-action');
        const originalText = btn.innerHTML;
        btn.innerHTML = `
            <div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
            <span>${currentLanguage === 'ar' ? 'جاري النشر...' : 'Publishing...'}</span>
        `;
        btn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            showSuccess(currentLanguage === 'ar' ? 'تم نشر التطبيق بنجاح!' : 'App published successfully!');
        }, 2000);
    }
}

function shareApp() {
    document.getElementById('shareModal').classList.add('active');
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('active');
}

function copyShareUrl() {
    const input = document.getElementById('shareUrl');
    input.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = currentLanguage === 'ar' ? 'تم النسخ!' : 'Copied!';
    btn.style.background = '#10b981';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

function copyEmbedCode() {
    const textarea = document.getElementById('embedCode');
    textarea.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = currentLanguage === 'ar' ? 'تم النسخ!' : 'Copied!';
    btn.style.background = '#10b981';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

function shareOnTwitter() {
    const url = document.getElementById('shareUrl').value;
    const text = 'Check out this amazing app I created with Zentra!';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
}

function shareOnLinkedIn() {
    const url = document.getElementById('shareUrl').value;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank');
}

function shareOnFacebook() {
    const url = document.getElementById('shareUrl').value;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
}

function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    document.body.classList.toggle('fullscreen', isFullscreen);
    
    const btn = event.target.closest('.btn-action');
    
    if (isFullscreen) {
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
            <span>${currentLanguage === 'ar' ? 'خروج من ملء الشاشة' : 'Exit Fullscreen'}</span>
        `;
    } else {
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            <span>${currentLanguage === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}</span>
        `;
    }
}

function exportCode() {
    const appId = document.getElementById('previewId').textContent;
    
    // Show loading state
    const btn = event.target.closest('.btn-action');
    const originalText = btn.innerHTML;
    btn.innerHTML = `
        <div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
        <span>${currentLanguage === 'ar' ? 'جاري التصدير...' : 'Exporting...'}</span>
    `;
    btn.disabled = true;
    
    // Simulate export process
    setTimeout(() => {
        try {
            // Create download link
            const appData = sessionStorage.getItem('currentAppData') || createDemoApp();
            const blob = new Blob([appData], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `zentra-app-${appId}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showSuccess(currentLanguage === 'ar' ? 'تم تصدير الكود بنجاح!' : 'Code exported successfully!');
        } catch (error) {
            showError(currentLanguage === 'ar' ? 'فشل في تصدير الكود' : 'Failed to export code');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }, 1500);
}

// Language functions
function initializeLanguage() {
    const savedLanguage = localStorage.getItem('zentra_language') || 'en';
    setLanguage(savedLanguage);
}

function toggleLanguage() {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
}

function setLanguage(language) {
    currentLanguage = language;
    localStorage.setItem('zentra_language', language);
    
    // Update HTML attributes
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Update all translatable elements
    updateTranslations();
    
    // Update language toggle button
    const langText = document.querySelector('.lang-text');
    if (langText) {
        langText.textContent = language === 'en' ? 'العربية' : 'English';
    }
}

function updateTranslations() {
    const elements = document.querySelectorAll('[data-en], [data-ar]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            element.textContent = text;
        }
    });
}

// Utility functions
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    `;
    
    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('shareModal');
    if (e.target === modal) {
        closeShareModal();
    }
});

// Performance monitoring
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`Live Preview loaded in ${Math.round(loadTime)}ms`);
    
    // Track user interactions
    let interactionCount = 0;
    document.addEventListener('click', function() {
        interactionCount++;
    });
    
    // Log analytics after 30 seconds
    setTimeout(() => {
        console.log(`User interactions: ${interactionCount}`);
    }, 30000);
});

// Cookie Consent
function initializeCookieConsent() {
    const consent = localStorage.getItem('zentra_cookie_consent');
    if (!consent) {
        setTimeout(() => {
            document.getElementById('cookieConsent').classList.add('show');
        }, 2000);
    }
}

function acceptCookies() {
    localStorage.setItem('zentra_cookie_consent', 'accepted');
    document.getElementById('cookieConsent').classList.remove('show');
    showSuccess(currentLanguage === 'ar' ? 'تم قبول ملفات تعريف الارتباط' : 'Cookies accepted');
}

function declineCookies() {
    localStorage.setItem('zentra_cookie_consent', 'declined');
    document.getElementById('cookieConsent').classList.remove('show');
    showSuccess(currentLanguage === 'ar' ? 'تم رفض ملفات تعريف الارتباط' : 'Cookies declined');
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape to close modal or exit fullscreen
        if (e.key === 'Escape') {
            if (document.getElementById('shareModal').classList.contains('active')) {
                closeShareModal();
            } else if (isFullscreen) {
                toggleFullscreen();
            }
        }
        
        // F11 for fullscreen
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
        
        // Ctrl+E to export
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            exportCode();
        }
        
        // Ctrl+S to share
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            shareApp();
        }
        
        // Ctrl+P to publish
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            publishApp();
        }
    });
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .spinner {
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .preview-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #64748b;
        gap: 16px;
    }
    
    .preview-loading p {
        margin: 0;
        font-size: 1.1rem;
    }
`;
document.head.appendChild(style);

// Initialize touch gestures for mobile
if ('ontouchstart' in window) {
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeDistance = touchStartY - touchEndY;
        const minSwipeDistance = 50;
        
        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swipe up - could trigger fullscreen
                if (!isFullscreen) {
                    toggleFullscreen();
                }
            } else {
                // Swipe down - could exit fullscreen
                if (isFullscreen) {
                    toggleFullscreen();
                }
            }
        }
    }
}