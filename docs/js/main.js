// Global variables
let currentLanguage = 'en';
let isGenerating = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
    initializeAuth();
    initializeMobileMenu();
    initializeScrollEffects();
});

// Language Management
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
    
    // Update font family
    document.body.style.fontFamily = language === 'ar' 
        ? 'var(--font-family-ar)' 
        : 'var(--font-family-en)';
    
    // Update all translatable elements
    updateTranslations();
    
    // Update language toggle button
    updateLanguageToggle();
}

function updateTranslations() {
    const elements = document.querySelectorAll('[data-en], [data-ar]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-en-placeholder], [data-ar-placeholder]');
    placeholderElements.forEach(element => {
        const placeholder = element.getAttribute(`data-${currentLanguage}-placeholder`);
        if (placeholder) {
            element.placeholder = placeholder;
        }
    });
}

function updateLanguageToggle() {
    const langToggle = document.querySelector('.lang-toggle .lang-text');
    if (langToggle) {
        langToggle.textContent = currentLanguage === 'en' ? 'العربية' : 'English';
    }
}

// Authentication Management
function initializeAuth() {
    const token = localStorage.getItem('zentra_token');
    if (token) {
        // Verify token and update UI
        verifyToken(token);
    }
}

async function verifyToken(token) {
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateAuthUI(data.user);
        } else {
            // Token is invalid, remove it
            localStorage.removeItem('zentra_token');
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('zentra_token');
    }
}

function updateAuthUI(user) {
    const navActions = document.querySelector('.nav-actions');
    if (navActions && user) {
        navActions.innerHTML = `
            <button class="lang-toggle" onclick="toggleLanguage()">
                <span class="lang-text">${currentLanguage === 'en' ? 'العربية' : 'English'}</span>
            </button>
            <a href="dashboard.html" class="btn btn-outline" data-en="Dashboard" data-ar="لوحة التحكم">Dashboard</a>
            <button class="btn btn-secondary" onclick="logout()" data-en="Logout" data-ar="تسجيل الخروج">Logout</button>
        `;
        updateTranslations();
    }
}

async function logout() {
    try {
        const token = localStorage.getItem('zentra_token');
        if (token) {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('zentra_token');
        window.location.reload();
    }
}

// Mobile Menu
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
        
        // Close menu when clicking on nav links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
}

// Scroll Effects
function initializeScrollEffects() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = 'var(--shadow-md)';
            } else {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
    
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Utility Functions
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} fade-in`;
    alert.textContent = message;
    
    // Insert at the top of the page
    const main = document.querySelector('main') || document.body;
    main.insertBefore(alert, main.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : 'en-US', options);
}

function formatNumber(number) {
    return new Intl.NumberFormat(currentLanguage === 'ar' ? 'ar-SA' : 'en-US').format(number);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// API Helper Functions
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('zentra_token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Form Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
}

function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        // Remove existing error
        const existingError = field.parentNode.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error class
        field.classList.add('error');
        
        // Add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }
}

function clearFieldErrors() {
    const errorFields = document.querySelectorAll('.form-input.error, .form-textarea.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
    
    const errorMessages = document.querySelectorAll('.form-error');
    errorMessages.forEach(error => error.remove());
}

// Loading States
function setLoading(element, isLoading) {
    if (isLoading) {
        element.disabled = true;
        element.classList.add('loading');
        
        const originalText = element.textContent;
        element.dataset.originalText = originalText;
        
        element.innerHTML = `
            <div class="spinner"></div>
            <span>${currentLanguage === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
        `;
    } else {
        element.disabled = false;
        element.classList.remove('loading');
        element.textContent = element.dataset.originalText || element.textContent;
    }
}

// Password Toggle Function
function togglePassword(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const toggle = field.parentNode.querySelector('.password-toggle');
    const showText = toggle.querySelector('.show-text');
    const hideText = toggle.querySelector('.hide-text');
    
    if (field.type === 'password') {
        field.type = 'text';
        showText.style.display = 'none';
        hideText.style.display = 'block';
    } else {
        field.type = 'password';
        showText.style.display = 'block';
        hideText.style.display = 'none';
    }
}

// Password Toggle Function
function togglePassword(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const toggle = field.parentNode.querySelector('.password-toggle');
    const showText = toggle.querySelector('.show-text');
    const hideText = toggle.querySelector('.hide-text');
    
    if (field.type === 'password') {
        field.type = 'text';
        showText.style.display = 'none';
        hideText.style.display = 'block';
    } else {
        field.type = 'password';
        showText.style.display = 'block';
        hideText.style.display = 'none';
    }
}

// Make functions globally available
window.toggleLanguage = toggleLanguage;
window.setLanguage = setLanguage;
window.togglePassword = togglePassword;

// Export functions for use in other files
window.zentra = {
    setLanguage,
    toggleLanguage,
    showAlert,
    formatDate,
    formatNumber,
    apiRequest,
    validateEmail,
    validatePassword,
    validateUsername,
    showFieldError,
    clearFieldErrors,
    setLoading,
    debounce,
    throttle
};