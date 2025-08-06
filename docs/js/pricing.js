// Pricing page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializePricingPage();
    checkUserAuth();
});

function initializePricingPage() {
    // Initialize billing toggle
    const billingToggle = document.getElementById('billingToggle');
    if (billingToggle) {
        billingToggle.addEventListener('change', toggleBilling);
    }
    
    // Initialize scroll effects
    initializeScrollEffects();
    
    // Initialize mobile menu
    initializeMobileMenu();
}

function checkUserAuth() {
    const token = localStorage.getItem('zentra_token');
    if (token) {
        // User is logged in, update navigation
        updateNavForLoggedInUser();
    }
}

function updateNavForLoggedInUser() {
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
        navActions.innerHTML = `
            <button class="lang-toggle" onclick="zentra.toggleLanguage()">
                <span class="lang-text">${currentLanguage === 'en' ? 'العربية' : 'English'}</span>
            </button>
            <a href="dashboard.html" class="btn btn-outline" data-en="Dashboard" data-ar="لوحة التحكم">Dashboard</a>
            <button class="btn btn-secondary" onclick="logout()" data-en="Logout" data-ar="تسجيل الخروج">Logout</button>
        `;
        zentra.updateTranslations();
    }
}

function toggleBilling() {
    const billingToggle = document.getElementById('billingToggle');
    const isYearly = billingToggle.checked;
    
    // Toggle price display
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const yearlyPrices = document.querySelectorAll('.yearly-price');
    const yearlyNotes = document.querySelectorAll('.yearly-note');
    
    monthlyPrices.forEach(price => {
        price.style.display = isYearly ? 'none' : 'inline';
    });
    
    yearlyPrices.forEach(price => {
        price.style.display = isYearly ? 'inline' : 'none';
    });
    
    yearlyNotes.forEach(note => {
        note.style.display = isYearly ? 'block' : 'none';
    });
    
    // Add animation effect
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    });
}

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
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe pricing cards and FAQ items
    const animatedElements = document.querySelectorAll('.pricing-card, .faq-item, .comparison-table');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
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
    }
}

// Plan selection functions
function selectPlan(planName) {
    // Store selected plan in localStorage
    localStorage.setItem('selectedPlan', planName);
    
    // Redirect to registration with plan parameter
    window.location.href = `register.html?plan=${planName}`;
}

function startFreeTrial(planName) {
    // Store selected plan for trial
    localStorage.setItem('trialPlan', planName);
    
    // Redirect to registration
    window.location.href = `register.html?trial=${planName}`;
}

function contactSales() {
    // Show contact sales modal or redirect to contact form
    zentra.showAlert(
        currentLanguage === 'ar'
            ? 'سيتم توجيهك ��لى نموذج الاتصال قريباً'
            : 'Contact form coming soon',
        'info'
    );
    
    // For now, you could redirect to an email or contact form
    // window.location.href = 'mailto:sales@zentra.app?subject=Team Plan Inquiry';
}

// Pricing calculator functions
function calculateYearlyDiscount(monthlyPrice) {
    const yearlyPrice = monthlyPrice * 12 * 0.8; // 20% discount
    const savings = (monthlyPrice * 12) - yearlyPrice;
    return {
        yearlyPrice: yearlyPrice,
        monthlySavings: savings / 12,
        totalSavings: savings
    };
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(price);
}

// FAQ functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        const answer = item.querySelector('p');
        
        if (question && answer) {
            question.style.cursor = 'pointer';
            question.addEventListener('click', function() {
                const isOpen = answer.style.display === 'block';
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    const otherAnswer = otherItem.querySelector('p');
                    if (otherAnswer && otherAnswer !== answer) {
                        otherAnswer.style.display = 'none';
                        otherItem.classList.remove('open');
                    }
                });
                
                // Toggle current item
                if (isOpen) {
                    answer.style.display = 'none';
                    item.classList.remove('open');
                } else {
                    answer.style.display = 'block';
                    item.classList.add('open');
                }
            });
            
            // Initially hide answers
            answer.style.display = 'none';
        }
    });
}

// Plan comparison functionality
function highlightPlanFeature(feature) {
    const rows = document.querySelectorAll('.comparison-table tr');
    
    rows.forEach(row => {
        const firstCell = row.querySelector('td:first-child');
        if (firstCell && firstCell.textContent.toLowerCase().includes(feature.toLowerCase())) {
            row.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 2000);
        }
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
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

// Initialize additional features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFAQ();
    initializeSmoothScrolling();
    
    // Add click handlers to pricing cards
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        const planName = card.querySelector('h3').textContent.toLowerCase();
        const ctaButton = card.querySelector('.btn');
        
        if (ctaButton && !ctaButton.onclick) {
            ctaButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (planName === 'free') {
                    window.location.href = 'register.html';
                } else if (planName === 'team') {
                    contactSales();
                } else {
                    startFreeTrial(planName);
                }
            });
        }
    });
});

// Logout function for logged-in users
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
        window.location.reload();
    }
}

// Price animation on hover
function animatePriceOnHover() {
    const priceElements = document.querySelectorAll('.price .amount');
    
    priceElements.forEach(price => {
        const originalText = price.textContent;
        
        price.parentElement.parentElement.addEventListener('mouseenter', function() {
            price.style.transform = 'scale(1.1)';
            price.style.color = 'var(--primary-color)';
        });
        
        price.parentElement.parentElement.addEventListener('mouseleave', function() {
            price.style.transform = 'scale(1)';
            price.style.color = 'var(--text-primary)';
        });
    });
}

// Initialize price animations
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(animatePriceOnHover, 500);
});

// Handle URL parameters for plan selection
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightPlan = urlParams.get('highlight');
    
    if (highlightPlan) {
        setTimeout(() => {
            const planCard = document.querySelector(`[data-plan="${highlightPlan}"]`);
            if (planCard) {
                planCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                planCard.style.transform = 'scale(1.05)';
                planCard.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.3)';
                
                setTimeout(() => {
                    planCard.style.transform = '';
                    planCard.style.boxShadow = '';
                }, 2000);
            }
        }, 1000);
    }
}

// Initialize URL parameter handling
document.addEventListener('DOMContentLoaded', handleURLParameters);