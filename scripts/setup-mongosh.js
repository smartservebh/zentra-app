const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧹 MongoDB Shell Setup Script');
console.log('============================\n');

// Function to execute command with error handling
function executeCommand(command, description) {
    try {
        console.log(`📌 ${description}...`);
        execSync(command, { stdio: 'inherit', shell: true });
        console.log(`✅ ${description} - Success!\n`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} - Failed!`);
        console.error(`Error: ${error.message}\n`);
        return false;
    }
}

// Function to clean npm cache
function cleanNpmCache() {
    const npmCachePath = path.join(process.env.USERPROFILE || process.env.HOME, 'AppData', 'Local', 'npm-cache', '_npx');
    
    console.log('🗑️  Cleaning npm cache...');
    console.log(`Path: ${npmCachePath}\n`);
    
    // Try Windows command first
    if (process.platform === 'win32') {
        // Try rd command
        if (!executeCommand(`rd /s /q "${npmCachePath}" 2>nul`, 'Removing _npx folder (rd)')) {
            // Try rmdir as fallback
            executeCommand(`rmdir /s /q "${npmCachePath}" 2>nul`, 'Removing _npx folder (rmdir)');
        }
        
        // Also clean general npm cache
        executeCommand('npm cache clean --force', 'Cleaning npm cache');
    } else {
        // Unix/Linux/Mac
        executeCommand(`rm -rf "${npmCachePath}"`, 'Removing _npx folder');
        executeCommand('npm cache clean --force', 'Cleaning npm cache');
    }
}

// Function to install mongosh with retry
async function installMongosh(retries = 3) {
    console.log('🚀 Installing MongoDB Shell (mongosh)...\n');
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        console.log(`📍 Attempt ${attempt} of ${retries}`);
        
        // Clean cache before each attempt
        cleanNpmCache();
        
        // Wait a bit for filesystem to settle
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to run mongosh
        try {
            console.log('📦 Running npx mongosh --version...');
            const result = execSync('npx --yes mongosh --version', { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            console.log(`✅ MongoDB Shell installed successfully!`);
            console.log(`Version: ${result.trim()}\n`);
            
            // Test connection to local MongoDB
            console.log('🔌 Testing local MongoDB connection...');
            try {
                execSync('npx --yes mongosh --eval "db.version()" mongodb://localhost:27017/zentra', {
                    stdio: 'inherit'
                });
                console.log('✅ Successfully connected to local MongoDB!\n');
            } catch (error) {
                console.log('⚠️  Could not connect to local MongoDB (this is normal if MongoDB is not running)\n');
            }
            
            return true;
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
            
            if (attempt < retries) {
                console.log(`⏳ Waiting before retry...\n`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    
    return false;
}

// Main execution
async function main() {
    console.log('🔧 Starting MongoDB Shell setup...\n');
    console.log(`Platform: ${process.platform}`);
    console.log(`Node version: ${process.version}`);
    console.log(`NPM version: ${execSync('npm --version', { encoding: 'utf8' }).trim()}\n`);
    
    // Check if mongosh is already installed globally
    try {
        const version = execSync('mongosh --version', { encoding: 'utf8', stdio: 'pipe' });
        console.log('✅ MongoDB Shell is already installed globally!');
        console.log(`Version: ${version.trim()}\n`);
        return;
    } catch (error) {
        console.log('📌 MongoDB Shell not found globally, proceeding with npx installation...\n');
    }
    
    // Install mongosh
    const success = await installMongosh();
    
    if (success) {
        console.log('🎉 Setup completed successfully!');
        console.log('\n📝 You can now use mongosh with:');
        console.log('   npx mongosh                    # Connect to local MongoDB');
        console.log('   npx mongosh <connection-string> # Connect to remote MongoDB\n');
        
        // Create a convenience script
        const scriptContent = `@echo off
npx --yes mongosh %*`;
        
        try {
            fs.writeFileSync('mongosh.bat', scriptContent);
            console.log('💡 Created mongosh.bat for easier access');
            console.log('   You can now just type: mongosh\n');
        } catch (error) {
            // Ignore if can't create bat file
        }
    } else {
        console.error('\n❌ Failed to install MongoDB Shell after all attempts');
        console.error('\n🔍 Troubleshooting steps:');
        console.error('1. Run as Administrator');
        console.error('2. Close all Node.js processes');
        console.error('3. Manually delete: %USERPROFILE%\\AppData\\Local\\npm-cache');
        console.error('4. Try: npm install -g mongosh');
        process.exit(1);
    }
}

// Run the script
main().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
});