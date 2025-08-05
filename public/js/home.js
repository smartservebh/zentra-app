// Home page specific functionality
let currentGeneratedApp = null;

// Initialize home page
document.addEventListener('DOMContentLoaded', function() {
    initializePromptInput();
    initializeSuggestions();
    initializeTestimonials();
});

// Prompt Input Management
function initializePromptInput() {
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.querySelector('.generate-btn');
    
    if (promptInput && generateBtn) {
        // Enable/disable generate button based on input
        promptInput.addEventListener('input', function() {
            const hasText = this.value.trim().length >= 10;
            generateBtn.disabled = !hasText || isGenerating;
        });
        
        // Handle Enter key (Ctrl+Enter to generate)
        promptInput.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                if (!generateBtn.disabled) {
                    generateApp();
                }
            }
        });
        
        // Auto-resize textarea
        promptInput.addEventListener('input', autoResizeTextarea);
    }
}

function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 300) + 'px';
}

// Suggestion Management
function initializeSuggestions() {
    const suggestions = document.querySelectorAll('.suggestion');
    suggestions.forEach(suggestion => {
        suggestion.addEventListener('click', function() {
            fillPrompt(this);
        });
    });
}

function fillPrompt(suggestionElement) {
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.querySelector('.generate-btn');
    
    if (promptInput) {
        const text = suggestionElement.getAttribute(`data-${currentLanguage}`) || suggestionElement.textContent;
        promptInput.value = text;
        promptInput.focus();
        
        // Trigger input event to enable generate button
        promptInput.dispatchEvent(new Event('input'));
        
        // Auto-resize
        autoResizeTextarea.call(promptInput);
    }
}

// App Generation
async function generateApp() {
    if (isGenerating) return;
    
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.querySelector('.generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoading = generateBtn.querySelector('.btn-loading');
    const demoPreview = document.getElementById('demoPreview');
    
    const prompt = promptInput.value.trim();
    
    if (prompt.length < 10) {
        zentra.showAlert(
            currentLanguage === 'ar' 
                ? 'يرجى إدخال وصف أكثر تفصيلاً (10 أحرف على الأقل)'
                : 'Please enter a more detailed description (at least 10 characters)',
            'warning'
        );
        return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('zentra_token');
    if (!token) {
        // Show demo for non-logged users
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'سنعرض لك نموذج تجريبي. سجل الدخول للحصول على تطبيقات حقيقية!'
                : 'We\'ll show you a demo. Login to generate real apps!',
            'info'
        );
        
        // Show demo app after a delay
        isGenerating = true;
        generateBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        setTimeout(() => {
            showDemoApp();
            isGenerating = false;
            generateBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
        }, 2000);
        
        return;
    }
    
    try {
        isGenerating = true;
        
        // Update button state
        generateBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        // Hide previous preview
        if (demoPreview) {
            demoPreview.style.display = 'none';
        }
        
        // Show generating message
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'جاري إنشاء تطبيقك... قد يستغرق هذا بضع ثوانٍ'
                : 'Generating your app... This may take a few seconds',
            'info'
        );
        
        // Make API request
        const response = await zentra.apiRequest('/api/apps/generate', {
            method: 'POST',
            body: JSON.stringify({ prompt })
        });
        
        currentGeneratedApp = response.app;
        
        // Show success message
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'تم إنشاء تطبيقك بنجاح!'
                : 'Your app has been generated successfully!',
            'success'
        );
        
        // Show preview
        await showAppPreview(response.app.appId);
        
    } catch (error) {
        console.error('App generation error:', error);
        
        let errorMessage = currentLanguage === 'ar'
            ? 'فشل في إنشاء التطبيق. يرجى المحاولة مرة أخرى.'
            : 'Failed to generate app. Please try again.';
            
        if (error.message.includes('limit reached')) {
            errorMessage = currentLanguage === 'ar'
                ? 'لقد وصلت إلى الحد الأقصى لعدد التطبيقات في خطتك'
                : 'You have reached the app limit for your plan';
        } else if (error.message.includes('OpenAI')) {
            errorMessage = currentLanguage === 'ar'
                ? 'خدمة الذكاء الاصطناعي غير متوفرة حالياً. يرجى المحاولة لاحقاً.'
                : 'AI service is currently unavailable. Please try again later.';
        }
        
        zentra.showAlert(errorMessage, 'error');
        
    } finally {
        isGenerating = false;
        
        // Reset button state
        generateBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// App Preview
async function showAppPreview(appId) {
    try {
        // Store app data in sessionStorage for preview page
        if (currentGeneratedApp) {
            sessionStorage.setItem('currentAppData', currentGeneratedApp.htmlContent);
        }
        
        // Store preview data
        const previewData = {
            id: appId,
            name: currentGeneratedApp?.title || 'My App',
            code: {
                html: currentGeneratedApp?.htmlContent || '',
                css: currentGeneratedApp?.cssContent || '',
                js: currentGeneratedApp?.jsContent || ''
            },
            timestamp: Date.now()
        };
        
        sessionStorage.setItem('zentra_preview_data', JSON.stringify(previewData));
        
        // Open preview in new tab
        const previewUrl = `/preview/${appId}`;
        window.open(previewUrl, '_blank');
        
        // Show success message
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'تم فتح المعاينة في نافذة جديدة!'
                : 'Preview opened in new window!',
            'success'
        );
        
    } catch (error) {
        console.error('Preview error:', error);
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'فشل في عرض التطبيق'
                : 'Failed to preview app',
            'error'
        );
    }
}

// App Actions
function editApp() {
    if (!currentGeneratedApp) return;
    
    // Redirect to dashboard with app ID
    window.location.href = `dashboard.html?edit=${currentGeneratedApp.appId}`;
}

async function saveApp() {
    if (!currentGeneratedApp) return;
    
    try {
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'تم حفظ التطبيق في لوحة التحكم'
                : 'App saved to your dashboard',
            'success'
        );
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Save app error:', error);
        zentra.showAlert(
            currentLanguage === 'ar'
                ? 'فشل في حفظ التطبيق'
                : 'Failed to save app',
            'error'
        );
    }
}

// Demo Apps (for when user is not logged in)
const demoApps = {
    en: [
        {
            title: "Todo List App",
            description: "A simple and elegant todo list application",
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo List</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .todo-form { padding: 30px; border-bottom: 1px solid #eee; }
        .input-group { display: flex; gap: 10px; }
        .todo-input { flex: 1; padding: 15px; border: 2px solid #eee; border-radius: 10px; font-size: 16px; }
        .todo-input:focus { outline: none; border-color: #667eea; }
        .add-btn { padding: 15px 25px; background: #667eea; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; }
        .add-btn:hover { background: #5a6fd8; }
        .todo-list { padding: 30px; }
        .todo-item { display: flex; align-items: center; padding: 15px; margin-bottom: 10px; background: #f8f9fa; border-radius: 10px; transition: all 0.3s; }
        .todo-item:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .todo-item.completed { opacity: 0.6; text-decoration: line-through; }
        .todo-checkbox { margin-right: 15px; }
        .todo-text { flex: 1; font-size: 16px; }
        .delete-btn { background: #ff4757; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; }
        .empty-state { text-align: center; color: #666; padding: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 Todo List</h1>
            <p>Stay organized and productive</p>
        </div>
        <div class="todo-form">
            <div class="input-group">
                <input type="text" class="todo-input" placeholder="Add a new task..." id="todoInput">
                <button class="add-btn" onclick="addTodo()">Add Task</button>
            </div>
        </div>
        <div class="todo-list" id="todoList">
            <div class="empty-state">
                <p>No tasks yet. Add one above!</p>
            </div>
        </div>
    </div>
    <script>
        let todos = [];
        function addTodo() {
            const input = document.getElementById('todoInput');
            const text = input.value.trim();
            if (text) {
                todos.push({ id: Date.now(), text, completed: false });
                input.value = '';
                renderTodos();
            }
        }
        function toggleTodo(id) {
            todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
            renderTodos();
        }
        function deleteTodo(id) {
            todos = todos.filter(todo => todo.id !== id);
            renderTodos();
        }
        function renderTodos() {
            const list = document.getElementById('todoList');
            if (todos.length === 0) {
                list.innerHTML = '<div class="empty-state"><p>No tasks yet. Add one above!</p></div>';
                return;
            }
            list.innerHTML = todos.map(todo => \`
                <div class="todo-item \${todo.completed ? 'completed' : ''}">
                    <input type="checkbox" class="todo-checkbox" \${todo.completed ? 'checked' : ''} onchange="toggleTodo(\${todo.id})">
                    <span class="todo-text">\${todo.text}</span>
                    <button class="delete-btn" onclick="deleteTodo(\${todo.id})">Delete</button>
                </div>
            \`).join('');
        }
        document.getElementById('todoInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTodo();
        });
    </script>
</body>
</html>`
        }
    ],
    ar: [
        {
            title: "تطبيق قائمة المهام",
            description: "تطبيق بسيط وأنيق لإدارة المهام",
            html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>قائمة المهام</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Tajawal', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .todo-form { padding: 30px; border-bottom: 1px solid #eee; }
        .input-group { display: flex; gap: 10px; }
        .todo-input { flex: 1; padding: 15px; border: 2px solid #eee; border-radius: 10px; font-size: 16px; }
        .todo-input:focus { outline: none; border-color: #667eea; }
        .add-btn { padding: 15px 25px; background: #667eea; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; }
        .add-btn:hover { background: #5a6fd8; }
        .todo-list { padding: 30px; }
        .todo-item { display: flex; align-items: center; padding: 15px; margin-bottom: 10px; background: #f8f9fa; border-radius: 10px; transition: all 0.3s; }
        .todo-item:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .todo-item.completed { opacity: 0.6; text-decoration: line-through; }
        .todo-checkbox { margin-left: 15px; }
        .todo-text { flex: 1; font-size: 16px; }
        .delete-btn { background: #ff4757; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; }
        .empty-state { text-align: center; color: #666; padding: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 قائمة المهام</h1>
            <p>ابق منظماً ومنتجاً</p>
        </div>
        <div class="todo-form">
            <div class="input-group">
                <input type="text" class="todo-input" placeholder="أضف مهمة جديدة..." id="todoInput">
                <button class="add-btn" onclick="addTodo()">إضافة مهمة</button>
            </div>
        </div>
        <div class="todo-list" id="todoList">
            <div class="empty-state">
                <p>لا توجد مهام بعد. أضف واحدة أعلاه!</p>
            </div>
        </div>
    </div>
    <script>
        let todos = [];
        function addTodo() {
            const input = document.getElementById('todoInput');
            const text = input.value.trim();
            if (text) {
                todos.push({ id: Date.now(), text, completed: false });
                input.value = '';
                renderTodos();
            }
        }
        function toggleTodo(id) {
            todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
            renderTodos();
        }
        function deleteTodo(id) {
            todos = todos.filter(todo => todo.id !== id);
            renderTodos();
        }
        function renderTodos() {
            const list = document.getElementById('todoList');
            if (todos.length === 0) {
                list.innerHTML = '<div class="empty-state"><p>لا توجد مهام بعد. أضف واحدة أعلاه!</p></div>';
                return;
            }
            list.innerHTML = todos.map(todo => \`
                <div class="todo-item \${todo.completed ? 'completed' : ''}">
                    <input type="checkbox" class="todo-checkbox" \${todo.completed ? 'checked' : ''} onchange="toggleTodo(\${todo.id})">
                    <span class="todo-text">\${todo.text}</span>
                    <button class="delete-btn" onclick="deleteTodo(\${todo.id})">حذف</button>
                </div>
            \`).join('');
        }
        document.getElementById('todoInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTodo();
        });
    </script>
</body>
</html>`
        }
    ]
};

function showDemoApp() {
    const demoPreview = document.getElementById('demoPreview');
    const appFrame = document.getElementById('appFrame');
    
    if (!demoPreview || !appFrame) return;
    
    const demo = demoApps[currentLanguage][0];
    
    // Create blob URL for the demo HTML
    const blob = new Blob([demo.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    appFrame.src = url;
    demoPreview.style.display = 'block';
    demoPreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Update preview header
    const previewHeader = demoPreview.querySelector('.preview-header h3');
    if (previewHeader) {
        previewHeader.textContent = demo.title;
    }
    
    // Update action buttons for demo
    const previewActions = demoPreview.querySelector('.preview-actions');
    if (previewActions) {
        previewActions.innerHTML = `
            <a href="register.html" class="btn btn-primary" data-en="Sign Up to Save" data-ar="سجل لحفظ التطبيق">Sign Up to Save</a>
        `;
        zentra.updateTranslations();
    }
}

// Initialize Testimonials
function initializeTestimonials() {
    const track = document.getElementById('testimonialsTrack');
    if (!track) return;
    
    // Clone testimonials for infinite scroll
    const cards = track.querySelectorAll('.testimonial-card');
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
}

// Initialize demo for non-logged-in users
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('zentra_token');
    if (!token) {
        // Show demo after a short delay
        setTimeout(() => {
            const promptInput = document.getElementById('promptInput');
            if (promptInput && !promptInput.value) {
                const demoPrompt = currentLanguage === 'ar' 
                    ? 'أنشئ تطبيق قائمة مهام بسيط'
                    : 'Create a simple todo list app';
                promptInput.value = demoPrompt;
                showDemoApp();
            }
        }, 3000);
    }
});