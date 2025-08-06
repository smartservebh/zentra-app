#!/usr/bin/env node

/**
 * Email Testing Script for Zentra
 * ================================
 * This script tests the email configuration and sends test emails
 * 
 * Usage: node scripts/testEmail.js [email@example.com]
 */

require('dotenv').config();
const emailService = require('../services/emailService');

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

// Test email address (can be passed as argument)
const testEmail = process.argv[2] || process.env.TEST_EMAIL || 'test@example.com';

console.log(`${colors.cyan}==================================${colors.reset}`);
console.log(`${colors.bright}Zentra Email Configuration Test${colors.reset}`);
console.log(`${colors.cyan}==================================${colors.reset}\n`);

// Check environment variables
function checkEnvironment() {
    console.log(`${colors.yellow}📋 Checking environment variables...${colors.reset}`);
    
    const sendgridConfigured = !!process.env.SENDGRID_API_KEY;
    const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_PASS;
    
    if (sendgridConfigured) {
        console.log(`${colors.green}✅ SENDGRID_API_KEY: Configured${colors.reset}`);
        console.log(`${colors.green}✅ Using SendGrid for email delivery${colors.reset}`);
    } else if (smtpConfigured) {
        console.log(`${colors.yellow}⚠️  SendGrid not configured, using SMTP${colors.reset}`);
        const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
        required.forEach(key => {
            if (process.env[key]) {
                const value = key.includes('PASS') ? '***' : process.env[key];
                console.log(`${colors.green}✅ ${key}: ${value}${colors.reset}`);
            } else {
                console.log(`${colors.red}❌ ${key}: Not configured${colors.reset}`);
            }
        });
    } else {
        console.log(`${colors.red}❌ No email service configured!${colors.reset}`);
        console.log(`\nPlease configure either:`);
        console.log(`1. SendGrid: Set SENDGRID_API_KEY in .env`);
        console.log(`2. SMTP: Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env`);
        return false;
    }
    
    // Check optional settings
    console.log(`\n${colors.cyan}Optional settings:${colors.reset}`);
    console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'noreply@zentrahub.pro'} (default)`);
    console.log(`EMAIL_REPLY_TO: ${process.env.EMAIL_REPLY_TO || 'info@zentrahub.pro'} (default)`);
    
    return sendgridConfigured || smtpConfigured;
}

// Test email connection
async function testConnection() {
    console.log(`\n${colors.yellow}🔌 Testing email service connection...${colors.reset}`);
    
    try {
        const isConnected = await emailService.testConnection();
        if (isConnected) {
            console.log(`${colors.green}✅ Email service is ready and connected${colors.reset}`);
            return true;
        } else {
            console.log(`${colors.red}❌ Email service connection failed${colors.reset}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}❌ Connection error: ${error.message}${colors.reset}`);
        return false;
    }
}

// Send test emails
async function sendTestEmails() {
    console.log(`\n${colors.yellow}📧 Sending test emails to: ${testEmail}${colors.reset}\n`);
    
    const testUser = {
        email: testEmail,
        username: 'Test User',
        plan: 'starter'
    };
    
    const tests = [
        {
            name: 'Welcome Email',
            func: () => emailService.sendWelcomeEmail(testUser)
        },
        {
            name: 'Verification Email',
            func: () => emailService.sendVerificationEmail(testUser, '123456')
        },
        {
            name: 'Password Reset Email',
            func: () => emailService.sendPasswordResetEmail(testUser, 'reset-token-123')
        },
        {
            name: 'App Generated Email',
            func: () => emailService.sendAppGeneratedEmail(testUser, {
                title: 'Test App',
                description: 'A test application',
                category: 'utility',
                appId: 'test-app-123',
                generationTime: 2500
            })
        },
        {
            name: 'Plan Changed Email',
            func: () => emailService.sendPlanChangedEmail(testUser, 'free', 'starter', {
                proratedAmount: 9.50
            })
        }
    ];
    
    let successCount = 0;
    
    for (const test of tests) {
        process.stdout.write(`Sending ${test.name}... `);
        
        try {
            const result = await test.func();
            if (result.success) {
                console.log(`${colors.green}✅ Sent successfully${colors.reset}`);
                successCount++;
            } else {
                console.log(`${colors.red}❌ Failed: ${result.error}${colors.reset}`);
            }
        } catch (error) {
            console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        }
    }
    
    console.log(`\n${colors.cyan}Summary: ${successCount}/${tests.length} emails sent successfully${colors.reset}`);
    return successCount === tests.length;
}

// Display configuration tips
function showConfigurationTips() {
    console.log(`\n${colors.yellow}💡 Configuration Tips:${colors.reset}`);
    console.log(`
1. ${colors.bright}SendGrid Setup:${colors.reset}
   - Sign up at https://sendgrid.com
   - Create an API key with 'Mail Send' permission
   - Set SMTP_USER=apikey
   - Set SMTP_PASS=your_sendgrid_api_key

2. ${colors.bright}Gmail Setup (for testing):${colors.reset}
   - Enable 2-factor authentication
   - Generate app-specific password
   - Set SMTP_HOST=smtp.gmail.com
   - Set SMTP_PORT=587
   - Set SMTP_USER=your-email@gmail.com
   - Set SMTP_PASS=your-app-password

3. ${colors.bright}Production Setup:${colors.reset}
   - Use SendGrid or AWS SES for production
   - Configure SPF, DKIM, and DMARC records
   - Set up email templates in multiple languages
   - Monitor email delivery rates
`);
}

// Main execution
async function main() {
    // Check environment
    if (!checkEnvironment()) {
        showConfigurationTips();
        process.exit(1);
    }
    
    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
        showConfigurationTips();
        process.exit(1);
    }
    
    // Send test emails
    const success = await sendTestEmails();
    
    if (success) {
        console.log(`\n${colors.green}🎉 All tests passed! Email service is working correctly.${colors.reset}`);
        console.log(`\n${colors.cyan}Check your inbox at: ${testEmail}${colors.reset}`);
    } else {
        console.log(`\n${colors.red}⚠️  Some tests failed. Please check your configuration.${colors.reset}`);
        showConfigurationTips();
    }
    
    process.exit(success ? 0 : 1);
}

// Run the script
main().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
});