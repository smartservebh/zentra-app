// Live Preview JavaScript - Enhanced

let currentLanguage = 'en';
let previewTimer;
let timeRemaining = 3600; // 1 hour in seconds

// Initialize preview
document.addEventListener('DOMContentLoaded', function() {
    initializePreview();
    startExpiryTimer();
    initializeLanguage();
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
    
    // Try to get app data from sessionStorage first
    const appData = sessionStorage.getItem('currentAppData');
    if (appData) {
        const blob = new Blob([appData], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        frame.src = url;
    } else {
        // Fallback to server endpoint
        frame.src = `/api/apps/preview/${appId}`;
    }
    
    // Handle frame load events
    frame.onload = function() {
        console.log('App preview loaded successfully');
    };
    
    frame.onerror = function() {
        console.error('Failed to load app preview');
        showError('Failed to load app preview');
    };
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
    document.body.classList.toggle('fullscreen');
    
    const btn = event.target.closest('.btn-action');
    const isFullscreen = document.body.classList.contains('fullscreen');
    
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
        // Create download link
        const appData = sessionStorage.getItem('currentAppData') || '<html><body><h1>Demo App</h1></body></html>';
        const blob = new Blob([appData], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `zentra-app-${appId}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        btn.innerHTML = originalText;
        btn.disabled = false;
        showSuccess(currentLanguage === 'ar' ? 'تم تصدير الكود بنجاح!' : 'Code exported successfully!');
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

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape to close modal
    if (e.key === 'Escape') {
        closeShareModal();
    }
    
    // F11 for fullscreen
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
    
    // Ctrl+S to export
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        exportCode();
    }
});

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
`;
document.head.appendChild(style);