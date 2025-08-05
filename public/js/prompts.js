// Prompts Page JavaScript

let currentPage = 1;
const itemsPerPage = 10;
let allPrompts = [];
let filteredPrompts = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadPrompts();
    await loadStats();
    setupEventListeners();
    
    // Setup character counter
    const promptText = document.getElementById('promptText');
    const charCount = document.getElementById('charCount');
    
    if (promptText) {
        promptText.addEventListener('input', () => {
            charCount.textContent = promptText.value.length;
        });
    }
});

// Load prompts from API
async function loadPrompts() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch('/api/prompts/my-prompts?limit=1000', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            allPrompts = data.prompts;
            filterPrompts();
        } else {
            console.error('Failed to load prompts');
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading prompts:', error);
        showEmptyState();
    }
}

// Load statistics
async function loadStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/prompts/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateStats(data.stats);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update statistics display
function updateStats(stats) {
    document.getElementById('totalPrompts').textContent = stats.total || 0;
    document.getElementById('completedPrompts').textContent = stats.completed || 0;
    document.getElementById('processingPrompts').textContent = stats.processing || 0;
    document.getElementById('failedPrompts').textContent = stats.failed || 0;
}

// Filter prompts
function filterPrompts() {
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
    
    filteredPrompts = allPrompts.filter(prompt => {
        let matches = true;
        
        if (statusFilter && prompt.status !== statusFilter) {
            matches = false;
        }
        
        if (typeFilter && prompt.appType !== typeFilter) {
            matches = false;
        }
        
        if (searchFilter && !prompt.promptText.toLowerCase().includes(searchFilter)) {
            matches = false;
        }
        
        return matches;
    });
    
    currentPage = 1;
    displayPrompts();
}

// Display prompts
function displayPrompts() {
    const promptsList = document.getElementById('promptsList');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const promptsToShow = filteredPrompts.slice(startIndex, endIndex);
    
    if (promptsToShow.length === 0) {
        showEmptyState();
        return;
    }
    
    promptsList.innerHTML = promptsToShow.map(prompt => createPromptCard(prompt)).join('');
    updatePagination();
}

// Create prompt card HTML
function createPromptCard(prompt) {
    const statusIcon = {
        pending: '⏳',
        processing: '⚙️',
        completed: '✅',
        failed: '❌'
    };
    
    const appTypeLabels = {
        web: 'Web App',
        mobile: 'Mobile App',
        api: 'API',
        fullstack: 'Full Stack',
        other: 'Other'
    };
    
    const date = new Date(prompt.createdAt).toLocaleDateString();
    const time = new Date(prompt.createdAt).toLocaleTimeString();
    
    return `
        <div class="prompt-card" onclick="showPromptDetails('${prompt._id}')">
            <div class="prompt-header">
                <div class="prompt-info">
                    <h3>${appTypeLabels[prompt.appType] || prompt.appType}</h3>
                    <div class="prompt-meta">
                        <span>📅 ${date}</span>
                        <span>⏰ ${time}</span>
                        <span>📝 ${prompt.metadata?.wordCount || 0} words</span>
                    </div>
                </div>
                <div class="prompt-status ${prompt.status}">
                    <span>${statusIcon[prompt.status]}</span>
                    <span>${prompt.status.charAt(0).toUpperCase() + prompt.status.slice(1)}</span>
                </div>
            </div>
            
            <div class="prompt-text">
                ${prompt.promptText}
            </div>
            
            <div class="prompt-actions">
                ${prompt.status === 'completed' && prompt.generatedAppId ? 
                    `<button class="primary" onclick="viewApp(event, '${prompt.generatedAppId.appId}')">View App</button>` : ''}
                ${prompt.status === 'failed' ? 
                    `<button onclick="retryPrompt(event, '${prompt._id}')">Retry</button>` : ''}
                <button onclick="deletePrompt(event, '${prompt._id}')">Delete</button>
            </div>
        </div>
    `;
}

// Show empty state
function showEmptyState() {
    const promptsList = document.getElementById('promptsList');
    promptsList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <h3>No prompts yet</h3>
            <p>Start by creating your first prompt to generate an amazing app!</p>
            <button class="btn btn-primary" onclick="showNewPromptModal()">Create First Prompt</button>
        </div>
    `;
    document.getElementById('pagination').innerHTML = '';
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span class="page-info">...</span>`;
        }
    }
    
    // Next button
    html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    
    pagination.innerHTML = html;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayPrompts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show new prompt modal
function showNewPromptModal() {
    document.getElementById('newPromptModal').classList.add('active');
    document.getElementById('newPromptForm').reset();
    document.getElementById('charCount').textContent = '0';
}

// Close new prompt modal
function closeNewPromptModal() {
    document.getElementById('newPromptModal').classList.remove('active');
}

// Show prompt details
async function showPromptDetails(promptId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/prompts/${promptId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayPromptDetails(data.prompt);
            document.getElementById('promptDetailsModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading prompt details:', error);
    }
}

// Display prompt details
function displayPromptDetails(prompt) {
    const content = document.getElementById('promptDetailsContent');
    
    const appTypeLabels = {
        web: 'Web Application',
        mobile: 'Mobile App',
        api: 'API/Backend',
        fullstack: 'Full Stack App',
        other: 'Other'
    };
    
    content.innerHTML = `
        <div class="prompt-details">
            <div class="detail-section">
                <h3>Prompt Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <span class="detail-value">
                            <span class="prompt-status ${prompt.status}">
                                ${prompt.status.charAt(0).toUpperCase() + prompt.status.slice(1)}
                            </span>
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Type</span>
                        <span class="detail-value">${appTypeLabels[prompt.appType]}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Created</span>
                        <span class="detail-value">${new Date(prompt.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Word Count</span>
                        <span class="detail-value">${prompt.metadata?.wordCount || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Prompt Text</h3>
                <div class="prompt-full-text">
                    ${prompt.promptText}
                </div>
            </div>
            
            ${prompt.status === 'completed' && prompt.generatedAppId ? `
                <div class="detail-section">
                    <h3>Generated App</h3>
                    <div class="app-preview">
                        <h4>${prompt.generatedAppId.title}</h4>
                        <p>App ID: ${prompt.generatedAppId.appId}</p>
                        <a href="/app/${prompt.generatedAppId.appId}" target="_blank" class="app-preview-link">
                            View App →
                        </a>
                    </div>
                </div>
            ` : ''}
            
            ${prompt.status === 'failed' && prompt.error ? `
                <div class="detail-section">
                    <h3>Error Details</h3>
                    <div class="error-details">
                        <p><strong>Error:</strong> ${prompt.error.message}</p>
                        <p><strong>Code:</strong> ${prompt.error.code}</p>
                        <p><strong>Time:</strong> ${new Date(prompt.error.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Close prompt details modal
function closePromptDetailsModal() {
    document.getElementById('promptDetailsModal').classList.remove('active');
}

// View app
function viewApp(event, appId) {
    event.stopPropagation();
    window.open(`/app/${appId}`, '_blank');
}

// Retry prompt
async function retryPrompt(event, promptId) {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to retry this prompt?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/prompts/${promptId}/retry`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification('Prompt retry started!', 'success');
            await loadPrompts();
            await loadStats();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to retry prompt', 'error');
        }
    } catch (error) {
        console.error('Error retrying prompt:', error);
        showNotification('Failed to retry prompt', 'error');
    }
}

// Delete prompt
async function deletePrompt(event, promptId) {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this prompt?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/prompts/${promptId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification('Prompt deleted successfully', 'success');
            await loadPrompts();
            await loadStats();
        } else {
            showNotification('Failed to delete prompt', 'error');
        }
    } catch (error) {
        console.error('Error deleting prompt:', error);
        showNotification('Failed to delete prompt', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // New prompt form
    const newPromptForm = document.getElementById('newPromptForm');
    if (newPromptForm) {
        newPromptForm.addEventListener('submit', handleNewPrompt);
    }
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Handle new prompt submission
async function handleNewPrompt(e) {
    e.preventDefault();
    
    const appType = document.getElementById('appType').value;
    const promptText = document.getElementById('promptText').value;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/prompts/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                appType,
                promptText,
                language: getCurrentLanguage()
            })
        });

        if (response.ok) {
            showNotification('Prompt submitted! Your app is being generated...', 'success');
            closeNewPromptModal();
            await loadPrompts();
            await loadStats();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to create prompt', 'error');
        }
    } catch (error) {
        console.error('Error creating prompt:', error);
        showNotification('Failed to create prompt', 'error');
    }
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

// Get current language
function getCurrentLanguage() {
    return document.documentElement.getAttribute('lang') || 'en';
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}