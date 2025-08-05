#!/usr/bin/env node

/**
 * Production Readiness Check for Zentra
 * =====================================
 * This script checks if all services are properly configured
 * 
 * Usage: node scripts/checkReadiness.js
 */

require('dotenv').config();
const fs = require('fs');
const https = require('https');
const dns = require('dns').promises;

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

const checks = {
    environment: { passed: 0, failed: 0, warnings: 0 },
    database: { passed: 0, failed: 0, warnings: 0 },
    email: { passed: 0, failed: 0, warnings: 0 },
    security: { passed: 0, failed: 0, warnings: 0 },
    performance: { passed: 0, failed: 0, warnings: 0 }
};

console.log(`${colors.cyan}======================================${colors.reset}`);
console.log(`${colors.bright}Zentra Production Readiness Check${colors.reset}`);
console.log(`${colors.cyan}======================================${colors.reset}\n`);

// Check environment variables
async function checkEnvironmentVariables() {
    console.log(`${colors.yellow}🔧 Checking Environment Variables...${colors.reset}\n`);
    
    const required = {
        'OPENAI_API_KEY': 'OpenAI API key for app generation',
        'MONGODB_URI': 'MongoDB connection string',
        'JWT_SECRET': 'JWT secret for authentication',
        'SMTP_HOST': 'SMTP host for email',
        'SMTP_PORT': 'SMTP port for email',
        'SMTP_USER': 'SMTP username',
        'SMTP_PASS': 'SMTP password',
        'NODE_ENV': 'Node environment (should be "production")'
    };
    
    const optional = {
        'SENTRY_DSN': 'Error tracking',
        'REDIS_URL': 'Session storage',
        'CLOUDFLARE_API_TOKEN': 'CDN management',
        'PADDLE_VENDOR_ID': 'Payment processing'
    };
    
    // Check required variables
    for (const [key, description] of Object.entries(required)) {
        if (!process.env[key]) {
            console.log(`  ${colors.red}❌ ${key}${colors.reset} - ${description}`);
            checks.environment.failed++;
        } else {
            const value = key.includes('KEY') || key.includes('SECRET') || key.includes('PASS') 
                ? '***' : process.env[key];
            console.log(`  ${colors.green}✅ ${key}${colors.reset} = ${value}`);
            checks.environment.passed++;
        }
    }
    
    console.log(`\n${colors.cyan}Optional Variables:${colors.reset}`);
    
    // Check optional variables
    for (const [key, description] of Object.entries(optional)) {
        if (!process.env[key]) {
            console.log(`  ${colors.yellow}⚠️  ${key}${colors.reset} - ${description} (not configured)`);
            checks.environment.warnings++;
        } else {
            console.log(`  ${colors.green}✅ ${key}${colors.reset} - Configured`);
            checks.environment.passed++;
        }
    }
    
    // Check NODE_ENV
    if (process.env.NODE_ENV !== 'production') {
        console.log(`\n  ${colors.yellow}⚠️  NODE_ENV is "${process.env.NODE_ENV}", should be "production"${colors.reset}`);
        checks.environment.warnings++;
    }
}

// Check MongoDB connection
async function checkDatabase() {
    console.log(`\n${colors.yellow}🗄️  Checking Database Connection...${colors.reset}\n`);
    
    const mongoose = require('mongoose');
    
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        console.log(`  ${colors.green}✅ MongoDB connected successfully${colors.reset}`);
        checks.database.passed++;
        
        // Check if it's Atlas
        if (process.env.MONGODB_URI.includes('mongodb+srv')) {
            console.log(`  ${colors.green}✅ Using MongoDB Atlas (recommended)${colors.reset}`);
            checks.database.passed++;
        } else if (process.env.MONGODB_URI.includes('localhost')) {
            console.log(`  ${colors.yellow}⚠️  Using local MongoDB (not recommended for production)${colors.reset}`);
            checks.database.warnings++;
        }
        
        await mongoose.connection.close();
    } catch (error) {
        console.log(`  ${colors.red}❌ MongoDB connection failed: ${error.message}${colors.reset}`);
        checks.database.failed++;
    }
}

// Check email configuration
async function checkEmailService() {
    console.log(`\n${colors.yellow}📧 Checking Email Service...${colors.reset}\n`);
    
    const emailService = require('../services/emailService');
    
    try {
        const isConnected = await emailService.testConnection();
        if (isConnected) {
            console.log(`  ${colors.green}✅ Email service connected${colors.reset}`);
            checks.email.passed++;
            
            // Check if using SendGrid
            if (process.env.SMTP_HOST === 'smtp.sendgrid.net') {
                console.log(`  ${colors.green}✅ Using SendGrid (recommended)${colors.reset}`);
                checks.email.passed++;
            } else if (process.env.SMTP_HOST === 'smtp.gmail.com') {
                console.log(`  ${colors.yellow}⚠️  Using Gmail (not recommended for production)${colors.reset}`);
                checks.email.warnings++;
            }
        } else {
            console.log(`  ${colors.red}❌ Email service connection failed${colors.reset}`);
            checks.email.failed++;
        }
    } catch (error) {
        console.log(`  ${colors.red}❌ Email service error: ${error.message}${colors.reset}`);
        checks.email.failed++;
    }
}

// Check SSL and domain
async function checkSSLAndDomain() {
    console.log(`\n${colors.yellow}🔒 Checking SSL & Domain...${colors.reset}\n`);
    
    const domain = 'zentrahub.pro';
    
    // Check DNS
    try {
        const addresses = await dns.resolve4(domain);
        console.log(`  ${colors.green}✅ Domain resolves to: ${addresses.join(', ')}${colors.reset}`);
        checks.security.passed++;
    } catch (error) {
        console.log(`  ${colors.red}❌ Domain resolution failed: ${error.message}${colors.reset}`);
        checks.security.failed++;
    }
    
    // Check HTTPS
    return new Promise((resolve) => {
        https.get(`https://${domain}`, (res) => {
            if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
                console.log(`  ${colors.green}✅ HTTPS is working${colors.reset}`);
                checks.security.passed++;
                
                // Check SSL certificate
                const cert = res.socket.getPeerCertificate();
                if (cert.subject) {
                    console.log(`  ${colors.green}✅ SSL certificate valid for: ${cert.subject.CN}${colors.reset}`);
                    checks.security.passed++;
                    
                    // Check expiry
                    const expiry = new Date(cert.valid_to);
                    const daysUntilExpiry = Math.floor((expiry - new Date()) / (1000 * 60 * 60 * 24));
                    
                    if (daysUntilExpiry < 30) {
                        console.log(`  ${colors.yellow}⚠️  SSL certificate expires in ${daysUntilExpiry} days${colors.reset}`);
                        checks.security.warnings++;
                    } else {
                        console.log(`  ${colors.green}✅ SSL certificate valid for ${daysUntilExpiry} days${colors.reset}`);
                        checks.security.passed++;
                    }
                }
            } else {
                console.log(`  ${colors.yellow}⚠️  HTTPS returned status: ${res.statusCode}${colors.reset}`);
                checks.security.warnings++;
            }
            resolve();
        }).on('error', (error) => {
            console.log(`  ${colors.red}❌ HTTPS check failed: ${error.message}${colors.reset}`);
            checks.security.failed++;
            resolve();
        });
    });
}

// Check file permissions and structure
async function checkFileSystem() {
    console.log(`\n${colors.yellow}📁 Checking File System...${colors.reset}\n`);
    
    const requiredDirs = [
        'logs',
        'uploads',
        'generated-apps',
        'email-templates'
    ];
    
    for (const dir of requiredDirs) {
        if (fs.existsSync(dir)) {
            console.log(`  ${colors.green}✅ Directory exists: ${dir}${colors.reset}`);
            checks.performance.passed++;
            
            // Check write permissions
            try {
                fs.accessSync(dir, fs.constants.W_OK);
                console.log(`    ${colors.green}✓ Writable${colors.reset}`);
            } catch {
                console.log(`    ${colors.red}✗ Not writable${colors.reset}`);
                checks.performance.failed++;
            }
        } else {
            console.log(`  ${colors.yellow}⚠️  Directory missing: ${dir}${colors.reset}`);
            checks.performance.warnings++;
            
            // Try to create it
            try {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`    ${colors.green}✓ Created successfully${colors.reset}`);
            } catch (error) {
                console.log(`    ${colors.red}✗ Failed to create: ${error.message}${colors.reset}`);
            }
        }
    }
}

// Generate summary report
function generateReport() {
    console.log(`\n${colors.cyan}======================================${colors.reset}`);
    console.log(`${colors.bright}Summary Report${colors.reset}`);
    console.log(`${colors.cyan}======================================${colors.reset}\n`);
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;
    
    for (const [category, results] of Object.entries(checks)) {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        console.log(`${colors.bright}${categoryName}:${colors.reset}`);
        console.log(`  ${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
        console.log(`  ${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
        console.log(`  ${colors.yellow}⚠️  Warnings: ${results.warnings}${colors.reset}`);
        console.log('');
        
        totalPassed += results.passed;
        totalFailed += results.failed;
        totalWarnings += results.warnings;
    }
    
    console.log(`${colors.bright}Total:${colors.reset}`);
    console.log(`  ${colors.green}✅ Passed: ${totalPassed}${colors.reset}`);
    console.log(`  ${colors.red}❌ Failed: ${totalFailed}${colors.reset}`);
    console.log(`  ${colors.yellow}⚠️  Warnings: ${totalWarnings}${colors.reset}`);
    
    console.log(`\n${colors.cyan}======================================${colors.reset}`);
    
    if (totalFailed === 0) {
        console.log(`${colors.green}🎉 Your Zentra app is ready for production!${colors.reset}`);
        return 0;
    } else {
        console.log(`${colors.red}❌ Please fix the failed checks before deploying.${colors.reset}`);
        console.log(`\n${colors.yellow}📚 Check the documentation:${colors.reset}`);
        console.log(`  - docs/MONGODB_ATLAS_SETUP.md`);
        console.log(`  - docs/SENDGRID_SETUP.md`);
        console.log(`  - docs/SSL_CLOUDFLARE_SETUP.md`);
        console.log(`  - PRODUCTION_SETUP.md`);
        return 1;
    }
}

// Main execution
async function main() {
    await checkEnvironmentVariables();
    await checkDatabase();
    await checkEmailService();
    await checkSSLAndDomain();
    await checkFileSystem();
    
    const exitCode = generateReport();
    process.exit(exitCode);
}

// Run the script
main().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
});