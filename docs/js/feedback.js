// Feedback Page JavaScript

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadTestimonials();
    setupEventListeners();
});

// Load public testimonials
async function loadTestimonials() {
    try {
        const response = await fetch('/api/feedback/public?type=praise&limit=20');
        
        if (response.ok) {
            const data = await response.json();
            displayTestimonials(data.feedback);
        } else {
            showEmptyTestimonials();
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
        showEmptyTestimonials();
    }
}

// Display testimonials
function displayTestimonials(testimonials) {
    const grid = document.getElementById('testimonialsGrid');
    
    if (testimonials.length === 0) {
        showEmptyTestimonials();
        return;
    }
    
    grid.innerHTML = testimonials.map(testimonial => createTestimonialCard(testimonial)).join('');
}

// Create testimonial card
function createTestimonialCard(testimonial) {
    const typeColors = {
        praise: 'praise',
        feature: 'feature',
        improvement: 'improvement'
    };
    
    const userInitial = testimonial.userId?.username?.charAt(0).toUpperCase() || 'U';
    const date = new Date(testimonial.createdAt).toLocaleDateString();
    
    // Generate star rating
    let stars = '';
    if (testimonial.rating?.satisfaction) {
        for (let i = 1; i <= 5; i++) {
            stars += i <= testimonial.rating.satisfaction ? '⭐' : '☆';
        }
    }
    
    return `
        <div class="testimonial-card">
            <div class="testimonial-header">
                <div class="testimonial-user">
                    <div class="user-avatar">${userInitial}</div>
                    <div class="user-info">
                        <h4>${testimonial.userId?.username || 'Anonymous'}</h4>
                        <p>${date}</p>
                    </div>
                </div>
                <span class="testimonial-type ${typeColors[testimonial.type] || 'other'}">
                    ${testimonial.type}
                </span>
            </div>
            
            <div class="testimonial-content">
                <h5>${testimonial.subject}</h5>
                <p>${testimonial.message}</p>
                ${stars ? `
                    <div class="testimonial-rating">
                        <span class="stars">${stars}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Show empty testimonials state
function showEmptyTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    grid.innerHTML = `
        <div class="empty-testimonials">
            <p>No testimonials yet. Be the first to share your experience!</p>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('feedbackForm');
    if (form) {
        form.addEventListener('submit', handleFeedbackSubmit);
    }
}

// Handle feedback submission
async function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const formData = {
        type: document.getElementById('feedbackType').value,
        subject: document.getElementById('feedbackSubject').value,
        message: document.getElementById('feedbackMessage').value,
        priority: document.getElementById('feedbackPriority').value,
        isPublic: document.getElementById('makePublic').checked
    };
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (!token) {
        // For non-logged in users, show login prompt
        if (confirm('You need to be logged in to submit feedback. Would you like to login now?')) {
            window.location.href = '/login.html?redirect=feedback';
        }
        return;
    }
    
    try {
        const response = await fetch('/api/feedback/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showSuccessModal();
            document.getElementById('feedbackForm').reset();
            
            // Reload testimonials if the feedback was public
            if (formData.isPublic && formData.type === 'praise') {
                setTimeout(() => loadTestimonials(), 1000);
            }
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to submit feedback', 'error');
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showNotification('Failed to submit feedback. Please try again.', 'error');
    }
}

// Show success modal
function showSuccessModal() {
    document.getElementById('successModal').classList.add('active');
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
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

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});