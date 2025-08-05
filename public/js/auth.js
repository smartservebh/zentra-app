// Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthPage();
    checkExistingAuth();
});

function initializeAuthPage() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Initialize form validation
    initializeFormValidation();
}

function checkExistingAuth() {
    const token = localStorage.getItem('zentra_token');
    if (token) {
        // User is already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');
    
    // Clear previous errors
    zentra.clearFieldErrors();
    
    // Get form data
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe') === 'on';
    
    // Validate form
    let hasErrors = false;
    
    if (!email) {
        zentra.showFieldError('email', currentLanguage === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
        hasErrors = true;
    } else if (!zentra.validateEmail(email)) {
        zentra.showFieldError('email', currentLanguage === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address');
        hasErrors = true;
    }
    
    if (!password) {
        zentra.showFieldError('password', currentLanguage === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    try {
        // Show loading state
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        // Make login request
        const response = await zentra.apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Store token
        localStorage.setItem('zentra_token', response.token);
        
        // Store user data
        localStorage.setItem('zentra_user', JSON.stringify(response.user));
        
        // Show success message
        showSuccessMessage(
            currentLanguage === 'ar' 
                ? 'تم تسجيل الدخول بنجاح! جاري التوجيه...'
                : 'Login successful! Redirecting...'
        );
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = currentLanguage === 'ar'
            ? 'فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.'
            : 'Login failed. Please try again.';
            
        if (error.message.includes('Invalid email or password')) {
            errorMessage = currentLanguage === 'ar'
                ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                : 'Invalid email or password';
        } else if (error.message.includes('Account is deactivated')) {
            errorMessage = currentLanguage === 'ar'
                ? 'الحساب معطل. يرجى الاتصال بالدعم'
                : 'Account is deactivated. Please contact support';
        }
        
        zentra.showAlert(errorMessage, 'error');
        
    } finally {
        // Reset button state
        loginBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// Register Handler
async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const registerBtn = document.getElementById('registerBtn');
    const btnText = registerBtn.querySelector('.btn-text');
    const btnLoading = registerBtn.querySelector('.btn-loading');
    
    // Clear previous errors
    zentra.clearFieldErrors();
    
    // Get form data
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const preferredLanguage = currentLanguage;
    const agreeToTerms = formData.get('agreeToTerms') === 'on';
    
    // Validate form
    let hasErrors = false;
    
    if (!username) {
        zentra.showFieldError('username', currentLanguage === 'ar' ? 'اسم المستخدم مطلوب' : 'Username is required');
        hasErrors = true;
    } else if (!zentra.validateUsername(username)) {
        zentra.showFieldError('username', currentLanguage === 'ar' ? 'اسم المستخدم يجب أن يكون 3-30 حرف ويحتوي على أحرف وأرقام فقط' : 'Username must be 3-30 characters and contain only letters, numbers, and underscores');
        hasErrors = true;
    }
    
    if (!email) {
        zentra.showFieldError('email', currentLanguage === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
        hasErrors = true;
    } else if (!zentra.validateEmail(email)) {
        zentra.showFieldError('email', currentLanguage === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address');
        hasErrors = true;
    }
    
    if (!password) {
        zentra.showFieldError('password', currentLanguage === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required');
        hasErrors = true;
    } else if (!zentra.validatePassword(password)) {
        zentra.showFieldError('password', currentLanguage === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
        hasErrors = true;
    }
    
    if (!confirmPassword) {
        zentra.showFieldError('confirmPassword', currentLanguage === 'ar' ? 'تأكيد كلمة المرور مطلوب' : 'Password confirmation is required');
        hasErrors = true;
    } else if (password !== confirmPassword) {
        zentra.showFieldError('confirmPassword', currentLanguage === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
        hasErrors = true;
    }
    
    if (!agreeToTerms) {
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'يجب الموافقة على الشروط والأحكام'
                : 'You must agree to the terms and conditions',
            'warning'
        );
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    try {
        // Show loading state
        registerBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        // Make register request
        const response = await zentra.apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ 
                username, 
                email, 
                password, 
                preferredLanguage 
            })
        });
        
        // Store token
        localStorage.setItem('zentra_token', response.token);
        
        // Store user data
        localStorage.setItem('zentra_user', JSON.stringify(response.user));
        
        // Show success message
        showSuccessMessage(
            currentLanguage === 'ar' 
                ? 'تم إنشاء الحساب بنجاح! مرحباً بك في زنترا!'
                : 'Account created successfully! Welcome to Zentra!'
        );
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        
        let errorMessage = currentLanguage === 'ar'
            ? 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.'
            : 'Registration failed. Please try again.';
            
        if (error.message.includes('Email already registered')) {
            errorMessage = currentLanguage === 'ar'
                ? 'البريد الإلكتروني مسجل مسبقاً'
                : 'Email is already registered';
        } else if (error.message.includes('Username already taken')) {
            errorMessage = currentLanguage === 'ar'
                ? 'اسم المستخدم مستخدم مسبقاً'
                : 'Username is already taken';
        }
        
        zentra.showAlert(errorMessage, 'error');
        
    } finally {
        // Reset button state
        registerBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// Form Validation
function initializeFormValidation() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Clear error state when user starts typing
            if (this.classList.contains('error')) {
                this.classList.remove('error');
                const errorElement = this.parentNode.querySelector('.form-error');
                if (errorElement) {
                    errorElement.remove();
                }
            }
        });
    });
}

function validateField(field) {
    const name = field.name;
    const value = field.value.trim();
    
    // Clear previous error
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    let errorMessage = '';
    
    switch (name) {
        case 'email':
            if (value && !zentra.validateEmail(value)) {
                errorMessage = currentLanguage === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
            }
            break;
            
        case 'username':
            if (value && !zentra.validateUsername(value)) {
                errorMessage = currentLanguage === 'ar' ? 'اسم المستخدم غير صحيح' : 'Invalid username';
            }
            break;
            
        case 'password':
            if (value && !zentra.validatePassword(value)) {
                errorMessage = currentLanguage === 'ar' ? 'كلمة المرور ضعيفة' : 'Password is too weak';
            }
            break;
            
        case 'confirmPassword':
            const passwordField = document.querySelector('[name="password"]');
            if (value && passwordField && value !== passwordField.value) {
                errorMessage = currentLanguage === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
            }
            break;
    }
    
    if (errorMessage) {
        zentra.showFieldError(name, errorMessage);
    }
}

// Password Toggle
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

// Social Login
async function loginWithGoogle() {
    try {
        // Show loading state
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'جاري تسجيل الدخول مع جوجل...'
                : 'Signing in with Google...',
            'info'
        );
        
        // In production, this would use Google OAuth
        // For now, we'll simulate the flow
        
        // Simulate OAuth redirect
        const authWindow = window.open(
            'https://accounts.google.com/oauth/authorize?' +
            'client_id=YOUR_GOOGLE_CLIENT_ID&' +
            'redirect_uri=' + encodeURIComponent(window.location.origin + '/auth/google/callback') + '&' +
            'response_type=code&' +
            'scope=email profile&' +
            'access_type=offline&' +
            'prompt=consent',
            'Google Login',
            'width=500,height=600'
        );
        
        // Listen for OAuth callback
        window.addEventListener('message', async function handleGoogleAuth(event) {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'google-auth-success') {
                window.removeEventListener('message', handleGoogleAuth);
                
                try {
                    // Exchange code for token with backend
                    const response = await zentra.apiRequest('/api/auth/google', {
                        method: 'POST',
                        body: JSON.stringify({ 
                            code: event.data.code,
                            redirectUri: window.location.origin + '/auth/google/callback'
                        })
                    });
                    
                    // Store token
                    localStorage.setItem('zentra_token', response.token);
                    
                    // Store user data
                    localStorage.setItem('zentra_user', JSON.stringify(response.user));
                    
                    // Show success message
                    showSuccessMessage(
                        currentLanguage === 'ar' 
                            ? 'تم تسجيل الدخول بنجاح! مرحباً بك في زنترا!'
                            : 'Login successful! Welcome to Zentra!'
                    );
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                    
                } catch (error) {
                    console.error('Google auth error:', error);
                    zentra.showAlert(
                        currentLanguage === 'ar'
                            ? 'فشل في تسجيل الدخول مع جوجل'
                            : 'Google login failed',
                        'error'
                    );
                }
            } else if (event.data.type === 'google-auth-error') {
                window.removeEventListener('message', handleGoogleAuth);
                zentra.showAlert(
                    currentLanguage === 'ar'
                        ? 'تم إلغاء تسجيل الدخول'
                        : 'Login cancelled',
                    'warning'
                );
            }
        });
        
        // Check if popup was blocked
        if (!authWindow || authWindow.closed) {
            zentra.showAlert(
                currentLanguage === 'ar'
                    ? 'تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة والمحاولة مرة أخرى.'
                    : 'Popup was blocked. Please allow popups and try again.',
                'warning'
            );
        }
        
    } catch (error) {
        console.error('Google login error:', error);
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'فشل في تسجيل الدخول مع جوجل'
                : 'Google login failed',
            'error'
        );
    }
}

// Alternative Google Sign-In using Google Identity Services
function initializeGoogleSignIn() {
    // Load Google Identity Services library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
        // Initialize Google Sign-In
        if (window.google) {
            google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual client ID
                callback: handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: true,
            });
            
            // Render Google Sign-In button
            const googleBtnContainer = document.getElementById('googleSignInButton');
            if (googleBtnContainer) {
                google.accounts.id.renderButton(
                    googleBtnContainer,
                    {
                        theme: 'outline',
                        size: 'large',
                        width: '100%',
                        text: currentLanguage === 'ar' ? 'signin_with' : 'continue_with',
                        locale: currentLanguage
                    }
                );
            }
        }
    };
    document.head.appendChild(script);
}

// Handle Google Sign-In response
async function handleGoogleSignIn(response) {
    try {
        // Send ID token to backend
        const result = await zentra.apiRequest('/api/auth/google/verify', {
            method: 'POST',
            body: JSON.stringify({ 
                idToken: response.credential 
            })
        });
        
        // Store token
        localStorage.setItem('zentra_token', result.token);
        
        // Store user data
        localStorage.setItem('zentra_user', JSON.stringify(result.user));
        
        // Show success message
        showSuccessMessage(
            currentLanguage === 'ar' 
                ? 'تم تسجيل الدخول بنجاح! مرحباً بك في زنترا!'
                : 'Login successful! Welcome to Zentra!'
        );
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Google sign-in error:', error);
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'فشل في تسجيل الدخول مع جوجل'
                : 'Google login failed',
            'error'
        );
    }
}

// Initialize Google Sign-In on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we should initialize Google Sign-In
    const googleBtn = document.querySelector('.social-btn');
    if (googleBtn) {
        // For now, keep the manual button until Google Client ID is configured
        // Once you have a Google Client ID, uncomment the line below:
        // initializeGoogleSignIn();
    }
});

// Success Message
function showSuccessMessage(message) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert, .form-success');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success fade-in';
    successDiv.textContent = message;
    
    // Insert at the top of the form
    const form = document.querySelector('.auth-form');
    form.insertBefore(successDiv, form.firstChild);
}

// Utility Functions
function getFieldValue(name) {
    const field = document.querySelector(`[name="${name}"]`);
    return field ? field.value.trim() : '';
}

function setFieldValue(name, value) {
    const field = document.querySelector(`[name="${name}"]`);
    if (field) {
        field.value = value;
    }
}

function focusField(name) {
    const field = document.querySelector(`[name="${name}"]`);
    if (field) {
        field.focus();
    }
}