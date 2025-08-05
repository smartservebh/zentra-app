#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const App = require('./models/App');

async function setupDatabase() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zentra', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connected to MongoDB successfully!');
        
        // Create indexes
        console.log('📊 Creating database indexes...');
        
        // User indexes
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ username: 1 }, { unique: true });
        
        // App indexes
        await App.collection.createIndex({ userId: 1 });
        await App.collection.createIndex({ appId: 1 }, { unique: true });
        await App.collection.createIndex({ isPublic: 1, isPublished: 1 });
        await App.collection.createIndex({ category: 1 });
        await App.collection.createIndex({ createdAt: -1 });
        
        console.log('✅ Database indexes created successfully!');
        
        // Create admin user if it doesn't exist
        console.log('👤 Checking for admin user...');
        
        const adminExists = await User.findOne({ email: 'admin@zentra.app' });
        
        if (!adminExists) {
            console.log('🔧 Creating admin user...');
            
            const adminUser = new User({
                username: 'admin',
                email: 'admin@zentra.app',
                password: 'admin123', // This will be hashed automatically
                plan: 'team',
                isAdmin: true,
                preferredLanguage: 'en'
            });
            
            await adminUser.save();
            
            console.log('✅ Admin user created successfully!');
            console.log('📧 Email: admin@zentra.app');
            console.log('🔑 Password: admin123');
            console.log('⚠️  Please change the admin password after first login!');
        } else {
            console.log('✅ Admin user already exists');
        }
        
        // Create sample demo apps
        console.log('📱 Creating sample demo apps...');
        
        const demoAppsExist = await App.findOne({ title: 'Demo Todo App' });
        
        if (!demoAppsExist && adminExists) {
            const demoApps = [
                {
                    title: 'Demo Todo App',
                    description: 'A beautiful and functional todo list application',
                    prompt: 'Create a modern todo list app with add, edit, delete, and mark complete functionality',
                    promptLanguage: 'en',
                    userId: adminExists._id,
                    appId: 'demo-todo-app',
                    category: 'productivity',
                    isPublished: true,
                    isPublic: true,
                    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .todo-form { padding: 30px; border-bottom: 1px solid #eee; }
        .input-group { display: flex; gap: 10px; }
        .todo-input { flex: 1; padding: 15px; border: 2px solid #eee; border-radius: 10px; font-size: 16px; }
        .add-btn { padding: 15px 25px; background: #667eea; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; }
        .todo-list { padding: 30px; }
        .todo-item { display: flex; align-items: center; padding: 15px; margin-bottom: 10px; background: #f8f9fa; border-radius: 10px; }
        .todo-text { flex: 1; font-size: 16px; }
        .delete-btn { background: #ff4757; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 Todo App</h1>
            <p>Stay organized and productive</p>
        </div>
        <div class="todo-form">
            <div class="input-group">
                <input type="text" class="todo-input" placeholder="Add a new task..." id="todoInput">
                <button class="add-btn" onclick="addTodo()">Add Task</button>
            </div>
        </div>
        <div class="todo-list" id="todoList">
            <div style="text-align: center; color: #666; padding: 40px;">
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
        function deleteTodo(id) {
            todos = todos.filter(todo => todo.id !== id);
            renderTodos();
        }
        function renderTodos() {
            const list = document.getElementById('todoList');
            if (todos.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #666; padding: 40px;"><p>No tasks yet. Add one above!</p></div>';
                return;
            }
            list.innerHTML = todos.map(todo => \`
                <div class="todo-item">
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
</html>`,
                    cssContent: '/* CSS is embedded in HTML */',
                    jsContent: '/* JavaScript is embedded in HTML */',
                    views: 42,
                    likes: 8
                },
                {
                    title: 'تطبيق حاسبة',
                    description: 'حاسبة بسيطة وجميلة للعمليات الحسابية الأساسية',
                    prompt: 'أنشئ تطبيق حاسبة بسيط مع تصميم جميل',
                    promptLanguage: 'ar',
                    userId: adminExists._id,
                    appId: 'demo-calculator-ar',
                    category: 'utility',
                    isPublished: true,
                    isPublic: true,
                    htmlContent: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>حاسبة</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Tajawal', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .calculator { background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); padding: 30px; max-width: 400px; width: 100%; }
        .display { background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 20px; text-align: left; font-size: 2rem; font-weight: bold; min-height: 60px; display: flex; align-items: center; }
        .buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .btn { padding: 20px; border: none; border-radius: 10px; font-size: 1.2rem; font-weight: bold; cursor: pointer; transition: all 0.3s; }
        .btn:hover { transform: translateY(-2px); }
        .btn-number { background: #e9ecef; color: #333; }
        .btn-operator { background: #667eea; color: white; }
        .btn-equals { background: #28a745; color: white; grid-column: span 2; }
        .btn-clear { background: #dc3545; color: white; }
    </style>
</head>
<body>
    <div class="calculator">
        <div class="display" id="display">0</div>
        <div class="buttons">
            <button class="btn btn-clear" onclick="clearDisplay()">مسح</button>
            <button class="btn btn-operator" onclick="appendToDisplay('/')">/</button>
            <button class="btn btn-operator" onclick="appendToDisplay('*')">×</button>
            <button class="btn btn-operator" onclick="deleteLast()">⌫</button>
            <button class="btn btn-number" onclick="appendToDisplay('7')">7</button>
            <button class="btn btn-number" onclick="appendToDisplay('8')">8</button>
            <button class="btn btn-number" onclick="appendToDisplay('9')">9</button>
            <button class="btn btn-operator" onclick="appendToDisplay('-')">-</button>
            <button class="btn btn-number" onclick="appendToDisplay('4')">4</button>
            <button class="btn btn-number" onclick="appendToDisplay('5')">5</button>
            <button class="btn btn-number" onclick="appendToDisplay('6')">6</button>
            <button class="btn btn-operator" onclick="appendToDisplay('+')">+</button>
            <button class="btn btn-number" onclick="appendToDisplay('1')">1</button>
            <button class="btn btn-number" onclick="appendToDisplay('2')">2</button>
            <button class="btn btn-number" onclick="appendToDisplay('3')">3</button>
            <button class="btn btn-equals" onclick="calculate()" style="grid-row: span 2;">=</button>
            <button class="btn btn-number" onclick="appendToDisplay('0')" style="grid-column: span 2;">0</button>
            <button class="btn btn-number" onclick="appendToDisplay('.')">.</button>
        </div>
    </div>
    <script>
        let display = document.getElementById('display');
        let currentInput = '0';
        
        function updateDisplay() {
            display.textContent = currentInput;
        }
        
        function clearDisplay() {
            currentInput = '0';
            updateDisplay();
        }
        
        function deleteLast() {
            if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            updateDisplay();
        }
        
        function appendToDisplay(value) {
            if (currentInput === '0' && value !== '.') {
                currentInput = value;
            } else {
                currentInput += value;
            }
            updateDisplay();
        }
        
        function calculate() {
            try {
                let result = eval(currentInput.replace('×', '*'));
                currentInput = result.toString();
                updateDisplay();
            } catch (error) {
                currentInput = 'خطأ';
                updateDisplay();
                setTimeout(() => {
                    currentInput = '0';
                    updateDisplay();
                }, 1000);
            }
        }
    </script>
</body>
</html>`,
                    cssContent: '/* CSS is embedded in HTML */',
                    jsContent: '/* JavaScript is embedded in HTML */',
                    views: 28,
                    likes: 5
                }
            ];
            
            for (const demoApp of demoApps) {
                await new App(demoApp).save();
            }
            
            console.log('✅ Sample demo apps created successfully!');
        } else {
            console.log('✅ Demo apps already exist');
        }
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log('='.repeat(50));
        console.log('📊 Database Statistics:');
        
        const userCount = await User.countDocuments();
        const appCount = await App.countDocuments();
        const publicAppCount = await App.countDocuments({ isPublic: true });
        
        console.log(`👥 Total Users: ${userCount}`);
        console.log(`📱 Total Apps: ${appCount}`);
        console.log(`🌐 Public Apps: ${publicAppCount}`);
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('��� Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run setup
setupDatabase();