// Preview JavaScript

// Get preview ID from URL
const pathParts = window.location.pathname.split('/');
const previewId = pathParts[pathParts.length - 1] || generateRandomId();

// Global variables
let currentLanguage = localStorage.getItem('zentra_language') || 'en';
let previewData = null;
let expiryInterval = null;
let timeRemaining = 3600; // 1 hour in seconds

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializePreview();
    updateLanguage();
    startExpiryTimer();
});

function initializePreview() {
    // Set preview ID in UI
    document.getElementById('previewId').textContent = previewId;
    
    // Get preview data from sessionStorage
    const storedData = sessionStorage.getItem('zentra_preview_data');
    if (storedData) {
        previewData = JSON.parse(storedData);
        loadPreviewContent();
    } else {
        // Try to load from server
        loadPreviewFromServer();
    }
    
    // Set share URL
    const shareUrl = `https://zentrahub.pro/preview/${previewId}`;
    document.getElementById('shareUrl').value = shareUrl;
    
    // Update app name input listener
    document.getElementById('appNameInput')?.addEventListener('input', function() {
        const value = this.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        document.getElementById('appUrlPreview').textContent = value || 'my-app';
    });
}

function loadPreviewContent() {
    if (!previewData) return;
    
    const frame = document.getElementById('appPreviewFrame');
    
    // Combine HTML, CSS, and JS into a single document
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${previewData.name || 'Preview'}</title>
    <style>
        ${previewData.code?.css || ''}
    </style>
</head>
<body>
    ${previewData.code?.html || '<h1>No content available</h1>'}
    <script>
        ${previewData.code?.js || ''}
    </script>
</body>
</html>`;
    
    // Create blob URL and load in iframe
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    frame.src = url;
    
    // Set app name
    if (previewData.name) {
        const appNameInput = document.getElementById('appNameInput');
        if (appNameInput) {
            appNameInput.value = previewData.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
            document.getElementById('appUrlPreview').textContent = appNameInput.value;
        }
    }
}

async function loadPreviewFromServer() {
    try {
        // Check if preview is still valid
        const response = await fetch(`/api/preview/${previewId}/status`);
        if (!response.ok) {
            showExpiredMessage();
            return;
        }
        
        const status = await response.json();
        if (!status.valid) {
            showExpiredMessage();
            return;
        }
        
        // Update remaining time
        timeRemaining = status.expiresIn || 3600;
        
        // Load preview content
        // In production, this would load the actual preview data
        const frame = document.getElementById('appPreviewFrame');
        frame.src = `/generated-apps/${previewId}/app.html`;
        
    } catch (error) {
        console.error('Failed to load preview:', error);
        showErrorMessage();
    }
}

function showExpiredMessage() {
    const frame = document.getElementById('appPreviewFrame');
    frame.srcdoc = `
        <html>
            <body style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; text-align: center;">
                <div>
                    <h2>${currentLanguage === 'ar' ? 'انتهت صلاحية المعاينة' : 'Preview Expired'}</h2>
                    <p>${currentLanguage === 'ar' ? 'لقد انتهت صلاحية رابط المعاينة هذا' : 'This preview link has expired'}</p>
                    <button onclick="window.location.href='/editor'" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        ${currentLanguage === 'ar' ? 'العودة للمحرر' : 'Back to Editor'}
                    </button>
                </div>
            </body>
        </html>
    `;
}

function showErrorMessage() {
    const frame = document.getElementById('appPreviewFrame');
    frame.srcdoc = `
        <html>
            <body style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; text-align: center;">
                <div>
                    <h2>${currentLanguage === 'ar' ? 'خطأ في التحميل' : 'Loading Error'}</h2>
                    <p>${currentLanguage === 'ar' ? 'فشل في تحميل المعاينة' : 'Failed to load preview'}</p>
                </div>
            </body>
        </html>
    `;
}

// Timer Functions
function startExpiryTimer() {
    updateTimerDisplay();
    
    expiryInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(expiryInterval);
            showExpiredMessage();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const timerElement = document.getElementById('timeRemaining');
    if (timerElement) {
        timerElement.textContent = display;
        
        // Change color based on time remaining
        const expiryTimer = document.getElementById('expiryTimer');
        if (minutes < 5) {
            expiryTimer.style.color = 'var(--danger)';
        } else if (minutes < 15) {
            expiryTimer.style.color = 'var(--warning)';
        }
    }
}

// Navigation
function backToEditor() {
    window.location.href = '/editor';
}

// Publishing
function publishApp() {
    document.getElementById('publishModal').classList.add('show');
}

function closePublishModal() {
    document.getElementById('publishModal').classList.remove('show');
}

async function confirmPublish() {
    const appNameInput = document.getElementById('appNameInput');
    const appName = appNameInput.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    if (!appName) {
        showToast(currentLanguage === 'ar' ? 'الرجاء إدخال اسم التطبيق' : 'Please enter an app name');
        appNameInput.focus();
        return;
    }
    
    const publishType = document.querySelector('input[name="publishType"]:checked').value;
    const makePublic = document.getElementById('makePublic').checked;
    const enableAnalytics = document.getElementById('enableAnalytics').checked;
    
    // Show loading state
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Publishing...';
    btn.disabled = true;
    
    try {
        // In production, this would make an API call to publish the app
        const token = localStorage.getItem('zentra_token');
        
        const response = await fetch('/api/apps/publish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
                previewId,
                appName,
                publishType,
                makePublic,
                enableAnalytics,
                code: previewData?.code
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to publish');
        }
        
        const result = await response.json();
        
        closePublishModal();
        showToast(currentLanguage === 'ar' ? 'تم نشر التطبيق بنجاح!' : 'App published successfully!');
        
        // Redirect to published app
        setTimeout(() => {
            window.location.href = `/app/${appName}`;
        }, 1500);
        
    } catch (error) {
        console.error('Publish error:', error);
        showToast(
            currentLanguage === 'ar' ? 'فشل في نشر التطبيق' : 'Failed to publish app',
            'error'
        );
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Sharing
function shareApp() {
    document.getElementById('shareModal').classList.add('show');
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('show');
}

function copyShareUrl() {
    const input = document.getElementById('shareUrl');
    input.select();
    document.execCommand('copy');
    showToast(currentLanguage === 'ar' ? 'تم نسخ الرابط!' : 'URL copied!');
}

// Export
function exportCode() {
    document.getElementById('exportModal').classList.add('show');
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('show');
}

function exportAsZip() {
    if (!previewData || !previewData.code) {
        showToast(currentLanguage === 'ar' ? 'لا يوجد كود للتصدير' : 'No code to export', 'error');
        return;
    }
    
    // In production, use JSZip or similar
    showToast(currentLanguage === 'ar' ? 'جاري تحضير ملف ZIP...' : 'Preparing ZIP file...');
    
    // Create download links for each file
    const files = [
        { name: 'index.html', content: previewData.code.html },
        { name: 'styles.css', content: previewData.code.css },
        { name: 'script.js', content: previewData.code.js }
    ];
    
    // Simple implementation - download files individually
    files.forEach(file => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
    });
}

function exportToGithub() {
    showToast(currentLanguage === 'ar' ? 'قريباً: تكامل GitHub' : 'Coming soon: GitHub integration');
}

// Fullscreen
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

// Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility
function generateRandomId() {
    return Math.random().toString(36).substring(2, 9);
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
        
        document.getElementById('zentraUrl')?.addEventListener('change', function() {
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

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (expiryInterval) {
        clearInterval(expiryInterval);
    }
});