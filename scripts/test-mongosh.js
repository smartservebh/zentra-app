const { execSync } = require('child_process');

console.log('🧪 Testing MongoDB Shell Installation\n');

// Test 1: Check if mongosh is available
console.log('Test 1: Checking mongosh availability...');
try {
    const version = execSync('npx --yes mongosh --version', { encoding: 'utf8' });
    console.log('✅ mongosh is available');
    console.log(`   Version: ${version.trim()}\n`);
} catch (error) {
    console.error('❌ mongosh is not available');
    console.error('   Please run: node scripts/setup-mongosh.js\n');
    process.exit(1);
}

// Test 2: Try to connect to local MongoDB
console.log('Test 2: Testing MongoDB connection...');
try {
    const result = execSync('npx --yes mongosh --quiet --eval "db.version()" mongodb://localhost:27017/zentra', { 
        encoding: 'utf8',
        stdio: 'pipe'
    });
    console.log('✅ Successfully connected to MongoDB');
    console.log(`   MongoDB version: ${result.trim()}\n`);
    
    // Test 3: List databases
    console.log('Test 3: Listing databases...');
    const dbs = execSync('npx --yes mongosh --quiet --eval "db.adminCommand({listDatabases: 1}).databases.map(d => d.name).join(\', \')" mongodb://localhost:27017', { 
        encoding: 'utf8'
    });
    console.log('✅ Available databases:');
    console.log(`   ${dbs.trim()}\n`);
    
    // Test 4: Check Zentra collections
    console.log('Test 4: Checking Zentra database...');
    const collections = execSync('npx --yes mongosh --quiet --eval "db.getCollectionNames().join(\', \')" mongodb://localhost:27017/zentra', { 
        encoding: 'utf8'
    });
    console.log('✅ Zentra collections:');
    console.log(`   ${collections.trim() || '(no collections yet)'}\n`);
    
} catch (error) {
    console.error('⚠️  Could not connect to MongoDB');
    console.error('   Make sure MongoDB is running on localhost:27017');
    console.error('   Error:', error.message.split('\n')[0], '\n');
}

console.log('📋 Summary:');
console.log('- mongosh is installed and working');
console.log('- To connect: npx mongosh mongodb://localhost:27017/zentra');
console.log('- Or simply: npx mongosh (for default connection)\n');