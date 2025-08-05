#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Zentra Application...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found. Creating from template...');
    
    const envTemplate = `# Database
MONGODB_URI=mongodb://localhost:27017/zentra

# JWT Secret (Change this in production!)
JWT_SECRET=zentra-super-secret-jwt-key-change-in-production

# OpenAI API Key (Required for app generation)
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# App Generation Settings
MAX_APPS_FREE=3
MAX_APPS_PRO=50
MAX_APPS_TEAM=unlimited

# File Upload Limits
MAX_FILE_SIZE=10485760
MAX_FILES_PER_APP=20
`;
    
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ .env file created. Please update it with your configuration.\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    
    const npmInstall = spawn('npm', ['install'], {
        stdio: 'inherit',
        shell: true
    });
    
    npmInstall.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Dependencies installed successfully!\n');
            startServer();
        } else {
            console.error('❌ Failed to install dependencies');
            process.exit(1);
        }
    });
} else {
    startServer();
}

function startServer() {
    console.log('🌟 Starting Zentra server...\n');
    
    // Create generated-apps directory if it doesn't exist
    const generatedAppsPath = path.join(__dirname, 'generated-apps');
    if (!fs.existsSync(generatedAppsPath)) {
        fs.mkdirSync(generatedAppsPath, { recursive: true });
        console.log('📁 Created generated-apps directory');
    }
    
    // Start the server
    const server = spawn('node', ['server.js'], {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env }
    });
    
    server.on('close', (code) => {
        console.log(`\n🛑 Server stopped with code ${code}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down Zentra...');
        server.kill('SIGINT');
        process.exit(0);
    });
    
    // Display startup information
    setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        console.log('🎉 Zentra is running!');
        console.log('='.repeat(50));
        console.log('🌐 Local:    http://localhost:3000');
        console.log('📱 Mobile:   http://your-ip:3000');
        console.log('📚 Docs:     Check README.md for more info');
        console.log('='.repeat(50));
        console.log('\n💡 Quick Start:');
        console.log('1. Open http://localhost:3000 in your browser');
        console.log('2. Click "Get Started" to create an account');
        console.log('3. Start generating amazing apps with AI!');
        console.log('\n⚠️  Important:');
        console.log('- Make sure MongoDB is running');
        console.log('- Add your OpenAI API key to .env file');
        console.log('- Check the README.md for detailed setup');
        console.log('\n🔧 To stop the server: Press Ctrl+C');
        console.log('='.repeat(50) + '\n');
    }, 2000);
}