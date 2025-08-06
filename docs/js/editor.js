// Editor JavaScript

// Global variables
let currentLanguage = localStorage.getItem('zentra_language') || 'en';
let currentTheme = localStorage.getItem('zentra_theme') || 'light';
let currentFile = 'html';
let isGenerating = false;
let currentAppId = null;
let appCode = {
    html: '',
    css: '',
    js: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeEditor();
    updateLanguage();
    updateTheme();
    updateLineNumbers();
    
    // Auto-save project name
    document.getElementById('projectName').addEventListener('input', debounce(saveProjectName, 1000));
    
    // Code editor input
    document.getElementById('codeEditor').addEventListener('input', function() {
        appCode[currentFile] = this.value;
        updateLineNumbers();
        autoSave();
    });
    
    // Handle tab key in code editor
    document.getElementById('codeEditor').addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
        }
    });
});

// Initialize editor
function initializeEditor() {
    // Load saved project data if exists
    const savedProject = localStorage.getItem('zentra_current_project');
    if (savedProject) {
        const project = JSON.parse(savedProject);
        document.getElementById('projectName').value = project.name || 'My App';
        document.getElementById('promptInput').value = project.prompt || '';
        appCode = project.code || { html: '', css: '', js: '' };
        currentAppId = project.appId || null;
    }
    
    // Set initial code
    if (!appCode.html) {
        appCode.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to Your App</h1>
    <p>Start building something amazing!</p>
    <script src="script.js"></script>
</body>
</html>`;
        
        appCode.css = `/* Your CSS styles here */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
}

h1 {
    color: #333;
}`;
        
        appCode.js = `// Your JavaScript code here
console.log('App loaded!');`;
    }
    
    // Load initial code
    document.getElementById('codeEditor').value = appCode[currentFile];
}

// Tab switching
function switchTab(tab) {
    // Update tab UI
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}Tab`).classList.add('active');
}

// File switching
function switchFile(file) {
    // Save current file content
    appCode[currentFile] = document.getElementById('codeEditor').value;
    
    // Update UI
    document.querySelectorAll('.file-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-file="${file}"]`).classList.add('active');
    
    // Load new file content
    currentFile = file;
    document.getElementById('codeEditor').value = appCode[file];
    updateLineNumbers();
}

// Generate app
async function generateApp() {
    if (isGenerating) return;
    
    const prompt = document.getElementById('promptInput').value.trim();
    if (!prompt) {
        showToast(currentLanguage === 'ar' ? 'الرجاء إدخال وصف للتطبيق' : 'Please enter an app description');
        return;
    }
    
    const generateBtn = document.getElementById('generateBtn');
    const btnContent = generateBtn.querySelector('.btn-content');
    const btnLoading = generateBtn.querySelector('.btn-loading');
    
    try {
        isGenerating = true;
        btnContent.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        // Check if user is logged in
        const token = localStorage.getItem('zentra_token');
        if (!token) {
            showToast(
                currentLanguage === 'ar' 
                    ? 'يرجى تسجيل الدخول أولاً' 
                    : 'Please login first'
            );
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
            return;
        }
        
        // Make API request
        const response = await fetch('/api/apps/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ prompt })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate app');
        }
        
        const data = await response.json();
        
        // Update code
        appCode.html = data.app.htmlContent || '';
        appCode.css = data.app.cssContent || '';
        appCode.js = data.app.jsContent || '';
        
        // Update current app ID
        currentAppId = data.app.appId;
        
        // Update project name
        document.getElementById('projectName').value = data.app.title || 'Generated App';
        
        // Switch to code tab and show HTML
        switchTab('code');
        switchFile('html');
        
        // Save project
        saveProject();
        
        showToast(
            currentLanguage === 'ar' 
                ? 'تم إنشاء التطبيق بنجاح!' 
                : 'App generated successfully!'
        );
        
    } catch (error) {
        console.error('Generation error:', error);
        showToast(
            currentLanguage === 'ar' 
                ? 'فشل في إنشاء التطبيق' 
                : 'Failed to generate app',
            'error'
        );
    } finally {
        isGenerating = false;
        btnContent.style.display = 'flex';
        btnLoading.style.display = 'none';
    }
}

// Preview app
function previewApp() {
    // Save current state
    saveProject();
    
    // Generate preview ID if not exists
    if (!currentAppId) {
        currentAppId = generateId();
    }
    
    // Store app data for preview
    const previewData = {
        id: currentAppId,
        name: document.getElementById('projectName').value || 'My App',
        code: appCode,
        timestamp: Date.now()
    };
    
    sessionStorage.setItem('zentra_preview_data', JSON.stringify(previewData));
    
    // Open preview in new tab
    const previewUrl = `/preview/${currentAppId}`;
    window.open(previewUrl, '_blank');
}

// Use example
function useExample(prompt) {
    document.getElementById('promptInput').value = prompt;
    document.getElementById('promptInput').focus();
}

// Add to prompt
function addToPrompt(text) {
    const promptInput = document.getElementById('promptInput');
    const currentValue = promptInput.value.trim();
    
    if (currentValue) {
        promptInput.value = currentValue + ' ' + text;
    } else {
        promptInput.value = text;
    }
    
    promptInput.focus();
}

// Format code
function formatCode() {
    // Simple formatting - in production, use a proper formatter
    const editor = document.getElementById('codeEditor');
    let code = editor.value;
    
    if (currentFile === 'html') {
        // Basic HTML formatting
        code = code.replace(/></g, '>\n<');
    } else if (currentFile === 'css') {
        // Basic CSS formatting
        code = code.replace(/;/g, ';\n    ');
        code = code.replace(/{/g, ' {\n    ');
        code = code.replace(/}/g, '\n}\n');
    } else if (currentFile === 'js') {
        // Basic JS formatting
        code = code.replace(/;/g, ';\n');
        code = code.replace(/{/g, ' {\n    ');
        code = code.replace(/}/g, '\n}');
    }
    
    editor.value = code;
    appCode[currentFile] = code;
    updateLineNumbers();
    
    showToast(currentLanguage === 'ar' ? 'تم تنسيق الكود' : 'Code formatted');
}

// Copy code
function copyCode() {
    const code = document.getElementById('codeEditor').value;
    navigator.clipboard.writeText(code).then(() => {
        showToast(currentLanguage === 'ar' ? 'تم نسخ الكود' : 'Code copied');
    });
}

// Download code
function downloadCode() {
    const projectName = document.getElementById('projectName').value || 'my-app';
    const zip = new JSZip(); // Would need to include JSZip library
    
    // Add files to zip
    zip.file('index.html', appCode.html);
    zip.file('styles.css', appCode.css);
    zip.file('script.js', appCode.js);
    
    // Generate and download zip
    zip.generateAsync({ type: 'blob' }).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${projectName}.zip`;
        link.click();
    });
    
    showToast(currentLanguage === 'ar' ? 'جاري تحميل الكود' : 'Downloading code');
}

// Update line numbers
function updateLineNumbers() {
    const editor = document.getElementById('codeEditor');
    const lineNumbers = document.getElementById('lineNumbers');
    const lines = editor.value.split('\n').length;
    
    let numbersHtml = '';
    for (let i = 1; i <= lines; i++) {
        numbersHtml += i + '\n';
    }
    
    lineNumbers.textContent = numbersHtml;
}

// Save project
function saveProject() {
    const project = {
        name: document.getElementById('projectName').value,
        prompt: document.getElementById('promptInput').value,
        code: appCode,
        appId: currentAppId,
        timestamp: Date.now()
    };
    
    localStorage.setItem('zentra_current_project', JSON.stringify(project));
    
    // Update save status
    const saveStatus = document.getElementById('saveStatus');
    saveStatus.style.opacity = '1';
    setTimeout(() => {
        saveStatus.style.opacity = '0.5';
    }, 1000);
}

// Auto save
const autoSave = debounce(saveProject, 2000);

// Save project name
function saveProjectName() {
    const appName = document.getElementById('appName');
    if (appName) {
        appName.value = document.getElementById('projectName').value;
    }
    saveProject();
}

// Theme toggle
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('zentra_theme', currentTheme);
    updateTheme();
}

function updateTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

// Language toggle
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('zentra_language', currentLanguage);
    updateLanguage();
}

function updateLanguage() {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    
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

// Show toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility functions
function generateId() {
    return Math.random().toString(36).substring(2, 9);
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

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
        showToast(currentLanguage === 'ar' ? 'تم الحفظ' : 'Saved');
    }
    
    // Ctrl/Cmd + Enter to preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        previewApp();
    }
});