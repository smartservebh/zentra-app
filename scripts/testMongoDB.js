#!/usr/bin/env node

/**
 * MongoDB Connection Test Script for Zentra
 * =========================================
 * This script tests the MongoDB connection and basic operations
 * 
 * Usage: node scripts/testMongoDB.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

console.log(`${colors.cyan}===================================${colors.reset}`);
console.log(`${colors.bright}Zentra MongoDB Connection Test${colors.reset}`);
console.log(`${colors.cyan}===================================${colors.reset}\n`);

// Check environment variables
function checkEnvironment() {
    console.log(`${colors.yellow}📋 Checking environment variables...${colors.reset}`);
    
    if (!process.env.MONGODB_URI) {
        console.log(`${colors.red}❌ MONGODB_URI not found in environment variables${colors.reset}`);
        console.log(`\nPlease add MONGODB_URI to your .env file:`);
        console.log(`MONGODB_URI=mongodb://localhost:27017/zentra`);
        console.log(`or`);
        console.log(`MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zentra`);
        return false;
    }
    
    // Hide password in URI for display
    const displayUri = process.env.MONGODB_URI.replace(
        /:([^:@]+)@/,
        ':****@'
    );
    console.log(`${colors.green}✅ MONGODB_URI: ${displayUri}${colors.reset}`);
    return true;
}

// Test connection
async function testConnection() {
    console.log(`\n${colors.yellow}🔌 Connecting to MongoDB...${colors.reset}`);
    
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        console.log(`${colors.green}✅ Successfully connected to MongoDB${colors.reset}`);
        
        // Get connection details
        const db = mongoose.connection.db;
        const admin = db.admin();
        
        // Get server info
        const serverInfo = await admin.serverInfo();
        console.log(`\n${colors.cyan}📊 Server Information:${colors.reset}`);
        console.log(`  Version: ${serverInfo.version}`);
        console.log(`  Git Version: ${serverInfo.gitVersion}`);
        
        // Get database stats
        const dbStats = await db.stats();
        console.log(`\n${colors.cyan}💾 Database Statistics:${colors.reset}`);
        console.log(`  Database: ${db.databaseName}`);
        console.log(`  Collections: ${dbStats.collections}`);
        console.log(`  Documents: ${dbStats.objects}`);
        console.log(`  Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        
        return true;
    } catch (error) {
        console.log(`${colors.red}❌ Connection failed: ${error.message}${colors.reset}`);
        
        // Provide helpful error messages
        if (error.message.includes('ECONNREFUSED')) {
            console.log(`\n${colors.yellow}💡 Tip: Make sure MongoDB is running locally${colors.reset}`);
            console.log(`  Start MongoDB: mongod`);
        } else if (error.message.includes('authentication failed')) {
            console.log(`\n${colors.yellow}💡 Tip: Check your username and password${colors.reset}`);
        } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
            console.log(`\n${colors.yellow}💡 Tip: Check your MongoDB Atlas cluster URL${colors.reset}`);
        } else if (error.message.includes('bad auth')) {
            console.log(`\n${colors.yellow}💡 Tip: Verify your database user credentials${colors.reset}`);
        }
        
        return false;
    }
}

// Test basic operations
async function testOperations() {
    console.log(`\n${colors.yellow}🧪 Testing basic operations...${colors.reset}`);
    
    try {
        // Create a test schema
        const TestSchema = new mongoose.Schema({
            name: String,
            timestamp: { type: Date, default: Date.now },
            testData: Object
        });
        
        const TestModel = mongoose.model('Test', TestSchema);
        
        // Test 1: Create
        process.stdout.write(`  Creating test document... `);
        const testDoc = await TestModel.create({
            name: 'Connection Test',
            testData: { 
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date()
            }
        });
        console.log(`${colors.green}✅${colors.reset}`);
        
        // Test 2: Read
        process.stdout.write(`  Reading test document... `);
        const foundDoc = await TestModel.findById(testDoc._id);
        console.log(`${colors.green}✅${colors.reset}`);
        
        // Test 3: Update
        process.stdout.write(`  Updating test document... `);
        await TestModel.updateOne(
            { _id: testDoc._id },
            { $set: { name: 'Updated Test' } }
        );
        console.log(`${colors.green}✅${colors.reset}`);
        
        // Test 4: Delete
        process.stdout.write(`  Deleting test document... `);
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log(`${colors.green}✅${colors.reset}`);
        
        console.log(`\n${colors.green}✅ All operations completed successfully${colors.reset}`);
        return true;
    } catch (error) {
        console.log(`${colors.red}❌ Operation failed: ${error.message}${colors.reset}`);
        return false;
    }
}

// List collections
async function listCollections() {
    console.log(`\n${colors.yellow}📚 Listing collections...${colors.reset}`);
    
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        if (collections.length === 0) {
            console.log(`  No collections found (database is empty)`);
        } else {
            collections.forEach(collection => {
                console.log(`  - ${collection.name}`);
            });
        }
        
        return true;
    } catch (error) {
        console.log(`${colors.red}❌ Failed to list collections: ${error.message}${colors.reset}`);
        return false;
    }
}

// Check indexes
async function checkIndexes() {
    console.log(`\n${colors.yellow}🔍 Checking indexes...${colors.reset}`);
    
    try {
        const collections = ['users', 'apps'];
        
        for (const collectionName of collections) {
            const collection = mongoose.connection.db.collection(collectionName);
            
            // Check if collection exists
            const exists = await mongoose.connection.db
                .listCollections({ name: collectionName })
                .hasNext();
            
            if (exists) {
                const indexes = await collection.indexes();
                console.log(`\n  ${collectionName}:`);
                indexes.forEach(index => {
                    const keys = Object.keys(index.key).join(', ');
                    console.log(`    - ${index.name}: {${keys}}`);
                });
            }
        }
        
        return true;
    } catch (error) {
        console.log(`${colors.red}❌ Failed to check indexes: ${error.message}${colors.reset}`);
        return false;
    }
}

// Main execution
async function main() {
    // Check environment
    if (!checkEnvironment()) {
        process.exit(1);
    }
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
        process.exit(1);
    }
    
    // Run tests
    await testOperations();
    await listCollections();
    await checkIndexes();
    
    // Success message
    console.log(`\n${colors.green}🎉 MongoDB connection test completed successfully!${colors.reset}`);
    console.log(`\n${colors.cyan}Your MongoDB setup is ready for Zentra.${colors.reset}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log(`\n${colors.blue}Connection closed.${colors.reset}`);
}

// Run the script
main().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
});