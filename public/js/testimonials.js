// Testimonials Slider with Continuous Movement
document.addEventListener('DOMContentLoaded', function() {
    const wrapper = document.querySelector('.testimonials-wrapper');
    const slider = document.getElementById('testimonialsSlider');
    const cards = slider.querySelectorAll('.testimonial-card');
    
    // Clone all cards for infinite scroll
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        slider.appendChild(clone);
    });
    
    let scrollPosition = 0;
    let isPaused = false;
    let animationId;
    
    // Continuous scroll function
    function continuousScroll() {
        if (!isPaused) {
            scrollPosition += 0.5; // Speed of scroll
            
            // Get the width of all original cards
            const totalWidth = cards.length * (cards[0].offsetWidth + 30);
            
            // Reset position when we've scrolled through all original cards
            if (scrollPosition >= totalWidth) {
                scrollPosition = 0;
            }
            
            slider.style.transform = `translateX(-${scrollPosition}px)`;
        }
        
        animationId = requestAnimationFrame(continuousScroll);
    }
    
    // Start continuous scroll
    continuousScroll();
    
    // Pause on hover
    wrapper.addEventListener('mouseenter', () => {
        isPaused = true;
    });
    
    wrapper.addEventListener('mouseleave', () => {
        isPaused = false;
    });
    
    // Touch support for mobile
    let touchStartX = 0;
    let touchCurrentX = 0;
    let isDragging = false;
    
    wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchCurrentX = touchStartX;
        isDragging = true;
        isPaused = true;
    });
    
    wrapper.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        touchCurrentX = e.touches[0].clientX;
        const diff = touchStartX - touchCurrentX;
        
        slider.style.transform = `translateX(-${scrollPosition + diff}px)`;
    });
    
    wrapper.addEventListener('touchend', () => {
        if (!isDragging) return;
        
        const diff = touchStartX - touchCurrentX;
        scrollPosition += diff;
        
        // Ensure scroll position stays within bounds
        const totalWidth = cards.length * (cards[0].offsetWidth + 30);
        if (scrollPosition < 0) scrollPosition = totalWidth + scrollPosition;
        if (scrollPosition >= totalWidth) scrollPosition = scrollPosition - totalWidth;
        
        isDragging = false;
        isPaused = false;
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
    });
    
    // Smooth scroll animations for new sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    const animatedSections = document.querySelectorAll('.ready-to-use, .backend-section, .testimonials');
    animatedSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});