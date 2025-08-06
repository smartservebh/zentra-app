// Home page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initializePromptInput();
    initializeSuggestions();
});

// Initialize prompt input functionality
function initializePromptInput() {
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.querySelector('.generate-btn');
    
    if (promptInput && generateBtn) {
        promptInput.addEventListener('input', function() {
            const hasText = this.value.trim().length > 0;
            generateBtn.disabled = !hasText;
            generateBtn.classList.toggle('disabled', !hasText);
        });
        
        // Enable enter key to generate
        promptInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey && !generateBtn.disabled) {
                generateApp();
            }
        });
    }
}

// Initialize suggestion buttons
function initializeSuggestions() {
    const suggestions = document.querySelectorAll('.suggestion');
    suggestions.forEach(suggestion => {
        suggestion.addEventListener('click', function() {
            fillPrompt(this);
        });
    });
}

// Fill prompt with suggestion
function fillPrompt(suggestionElement) {
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.querySelector('.generate-btn');
    
    if (promptInput) {
        const text = suggestionElement.getAttribute(`data-${currentLanguage}`) || suggestionElement.textContent;
        promptInput.value = text;
        promptInput.focus();
        
        // Enable generate button
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.classList.remove('disabled');
        }
        
        // Add visual feedback
        suggestionElement.classList.add('selected');
        setTimeout(() => {
            suggestionElement.classList.remove('selected');
        }, 200);
    }
}

// Generate app function
async function generateApp() {
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.querySelector('.generate-btn');
    const demoPreview = document.getElementById('demoPreview');
    
    if (!promptInput || !generateBtn || isGenerating) {
        return;
    }
    
    const prompt = promptInput.value.trim();
    if (!prompt) {
        zentra.showAlert(
            currentLanguage === 'ar' ? 'يرجى إدخال وصف للتطبيق' : 'Please enter an app description',
            'warning'
        );
        return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('zentra_token');
    if (!token) {
        zentra.showAlert(
            currentLanguage === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first',
            'warning'
        );
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }
    
    try {
        isGenerating = true;
        
        // Update button state
        const btnText = generateBtn.querySelector('.btn-text');
        const btnLoading = generateBtn.querySelector('.btn-loading');
        
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        generateBtn.disabled = true;
        
        // Make API request
        const response = await zentra.apiRequest('/api/apps/generate', {
            method: 'POST',
            body: JSON.stringify({
                prompt: prompt,
                language: currentLanguage
            })
        });
        
        if (response.success) {
            // Show preview
            showAppPreview(response.app);
            
            zentra.showAlert(
                currentLanguage === 'ar' ? 'تم إنشاء التطبيق بنجاح!' : 'App generated successfully!',
                'success'
            );
        } else {
            throw new Error(response.error || 'Generation failed');
        }
        
    } catch (error) {
        console.error('Generation error:', error);
        zentra.showAlert(
            currentLanguage === 'ar' ? 'حدث خطأ في إنشاء التطبيق' : 'Error generating app',
            'error'
        );
    } finally {
        isGenerating = false;
        
        // Reset button state
        const btnText = generateBtn.querySelector('.btn-text');
        const btnLoading = generateBtn.querySelector('.btn-loading');
        
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        generateBtn.disabled = false;
    }
}

// Show app preview
function showAppPreview(app) {
    const demoPreview = document.getElementById('demoPreview');
    const appFrame = document.getElementById('appFrame');
    
    if (demoPreview && appFrame && app) {
        // Set iframe source
        appFrame.src = `/preview/${app.id}`;
        
        // Show preview section
        demoPreview.style.display = 'block';
        
        // Scroll to preview
        demoPreview.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Store current app data
        window.currentApp = app;
    }
}

// Edit app function
function editApp() {
    if (window.currentApp) {
        window.location.href = `/editor?id=${window.currentApp.id}`;
    }
}

// Save app function
async function saveApp() {
    if (!window.currentApp) {
        return;
    }
    
    try {
        const response = await zentra.apiRequest(`/api/apps/${window.currentApp.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: window.currentApp.name,
                description: window.currentApp.description
            })
        });
        
        if (response.success) {
            zentra.showAlert(
                currentLanguage === 'ar' ? 'تم حفظ التطبيق بنجاح!' : 'App saved successfully!',
                'success'
            );
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        }
        
    } catch (error) {
        console.error('Save error:', error);
        zentra.showAlert(
            currentLanguage === 'ar' ? 'حدث خطأ في حفظ التطبيق' : 'Error saving app',
            'error'
        );
    }
}

// Make functions globally available
window.fillPrompt = fillPrompt;
window.generateApp = generateApp;
window.editApp = editApp;
window.saveApp = saveApp;