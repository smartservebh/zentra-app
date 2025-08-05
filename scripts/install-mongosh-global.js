const { execSync } = require('child_process');
const os = require('os');

console.log('🚀 Installing MongoDB Shell globally...\n');

try {
    // Check if already installed
    try {
        const version = execSync('mongosh --version', { encoding: 'utf8' });
        console.log('✅ MongoDB Shell is already installed!');
        console.log(`Version: ${version.trim()}`);
        process.exit(0);
    } catch (e) {
        // Not installed, continue
    }

    // Install globally
    console.log('📦 Installing mongosh globally...');
    console.log('This may take a few minutes...\n');
    
    if (os.platform() === 'win32') {
        // Windows
        execSync('npm install -g mongosh', { stdio: 'inherit' });
    } else {
        // Unix/Mac - might need sudo
        try {
            execSync('npm install -g mongosh', { stdio: 'inherit' });
        } catch (error) {
            console.log('\n⚠️  Permission denied. Trying with sudo...');
            execSync('sudo npm install -g mongosh', { stdio: 'inherit' });
        }
    }
    
    // Verify installation
    console.log('\n🔍 Verifying installation...');
    const version = execSync('mongosh --version', { encoding: 'utf8' });
    console.log('✅ MongoDB Shell installed successfully!');
    console.log(`Version: ${version.trim()}`);
    
    console.log('\n📝 Usage:');
    console.log('  mongosh                     # Connect to local MongoDB');
    console.log('  mongosh <connection-string> # Connect to remote MongoDB');
    console.log('  mongosh --help              # Show help\n');
    
} catch (error) {
    console.error('\n❌ Failed to install MongoDB Shell');
    console.error(error.message);
    
    console.log('\n🔧 Alternative installation methods:');
    console.log('\n1. Using Chocolatey (Windows):');
    console.log('   choco install mongodb-shell');
    
    console.log('\n2. Using Homebrew (Mac):');
    console.log('   brew install mongosh');
    
    console.log('\n3. Download directly:');
    console.log('   https://www.mongodb.com/try/download/shell');
    
    console.log('\n4. Using npm with different registry:');
    console.log('   npm config set registry https://registry.npmjs.org/');
    console.log('   npm install -g mongosh');
    
    process.exit(1);
}