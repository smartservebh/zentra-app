#!/usr/bin/env node

/**
 * MongoDB Shell Wrapper
 * This script provides a fallback solution for using mongosh
 * without requiring global installation or dealing with npm/npx issues
 */

const { spawn } = require('child_process');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

// Default connection string if none provided
const defaultConnection = 'mongodb://localhost:27017/zentra';

// If no args, connect to default
if (args.length === 0) {
    args.push(defaultConnection);
}

console.log('🚀 MongoDB Shell Wrapper');
console.log('========================\n');

// Try different methods to run mongosh
async function runMongosh() {
    const methods = [
        // Method 1: Try global mongosh
        {
            name: 'Global mongosh',
            command: 'mongosh',
            args: args
        },
        // Method 2: Try npx mongosh
        {
            name: 'npx mongosh',
            command: 'npx',
            args: ['--yes', 'mongosh', ...args]
        },
        // Method 3: Try npm exec
        {
            name: 'npm exec mongosh',
            command: 'npm',
            args: ['exec', '--yes', '--', 'mongosh', ...args]
        }
    ];

    for (const method of methods) {
        console.log(`Trying ${method.name}...`);
        
        try {
            await new Promise((resolve, reject) => {
                const child = spawn(method.command, method.args, {
                    stdio: 'inherit',
                    shell: true
                });

                child.on('error', (error) => {
                    reject(error);
                });

                child.on('exit', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Exit code: ${code}`));
                    }
                });
            });
            
            // If we get here, it worked
            return;
            
        } catch (error) {
            console.log(`❌ ${method.name} failed: ${error.message}\n`);
        }
    }
    
    // If all methods failed
    console.error('\n❌ Could not run MongoDB Shell');
    console.error('\n📋 Installation options:');
    console.error('\n1. Install Visual C++ Build Tools:');
    console.error('   https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022');
    console.error('   Then run: npm install -g mongosh');
    
    console.error('\n2. Use MongoDB Compass (GUI):');
    console.error('   https://www.mongodb.com/products/compass');
    
    console.error('\n3. Use online MongoDB Shell:');
    console.error('   https://www.mongodb.com/products/shell');
    
    console.error('\n4. Install mongosh without npm:');
    console.error('   Download from: https://www.mongodb.com/try/download/shell');
    console.error('   Extract and add to PATH');
    
    process.exit(1);
}

// Run the wrapper
runMongosh().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});