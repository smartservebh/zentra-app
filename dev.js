#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Zentra in Development Mode...\n');

// Check if nodemon is installed
const nodemonPath = path.join(__dirname, 'node_modules', '.bin', 'nodemon');
const hasNodemon = fs.existsSync(nodemonPath) || fs.existsSync(nodemonPath + '.cmd');

if (!hasNodemon) {
    console.log('📦 Installing nodemon for development...');
    
    const installNodemon = spawn('npm', ['install', '--save-dev', 'nodemon'], {
        stdio: 'inherit',
        shell: true
    });
    
    installNodemon.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Nodemon installed successfully!\n');
            startDevServer();
        } else {
            console.error('❌ Failed to install nodemon, falling back to regular node');
            startRegularServer();
        }
    });
} else {
    startDevServer();
}

function startDevServer() {
    console.log('🔄 Starting development server with auto-reload...\n');
    
    const server = spawn('npx', ['nodemon', 'server.js'], {
        stdio: 'inherit',
        shell: true,
        env: { 
            ...process.env,
            NODE_ENV: 'development'
        }
    });
    
    server.on('close', (code) => {
        console.log(`\n🛑 Development server stopped with code ${code}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down development server...');
        server.kill('SIGINT');
        process.exit(0);
    });
    
    displayDevInfo();
}

function startRegularServer() {
    console.log('🌟 Starting regular development server...\n');
    
    const server = spawn('node', ['server.js'], {
        stdio: 'inherit',
        shell: true,
        env: { 
            ...process.env,
            NODE_ENV: 'development'
        }
    });
    
    server.on('close', (code) => {
        console.log(`\n🛑 Server stopped with code ${code}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        server.kill('SIGINT');
        process.exit(0);
    });
    
    displayDevInfo();
}

function displayDevInfo() {
    setTimeout(() => {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Zentra Development Server is running!');
        console.log('='.repeat(60));
        console.log('🌐 Local:      http://localhost:3000');
        console.log('📱 Network:    http://your-ip:3000');
        console.log('🔧 Mode:       Development');
        console.log('🔄 Auto-reload: Enabled');
        console.log('='.repeat(60));
        console.log('\n🛠️  Development Features:');
        console.log('• Auto-restart on file changes');
        console.log('• Detailed error messages');
        console.log('• Development logging');
        console.log('• Hot reload for frontend changes');
        console.log('\n📝 Quick Development Tips:');
        console.log('• Edit files and see changes instantly');
        console.log('• Check browser console for errors');
        console.log('• Use browser dev tools for debugging');
        console.log('• MongoDB must be running locally');
        console.log('\n🔧 To stop: Press Ctrl+C');
        console.log('='.repeat(60) + '\n');
    }, 2000);
}