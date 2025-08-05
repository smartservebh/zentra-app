const fs = require('fs-extra');
const path = require('path');

console.log('🏗️  Building Zentra for production...');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
fs.ensureDirSync(distDir);

// Copy public files to dist
console.log('📁 Copying public files...');
fs.copySync(path.join(__dirname, 'public'), distDir);

// Update URLs for production
console.log('🔧 Updating URLs for production...');
const filesToUpdate = [
  'index.html',
  'dashboard.html',
  'login.html',
  'register.html',
  'pricing.html',
  'faq.html',
  'privacy.html',
  'terms.html',
  'refund.html',
  'js/main.js',
  'js/dashboard.js',
  'js/auth.js'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace localhost URLs with production URLs
    content = content.replace(/http:\/\/localhost:3000/g, 'https://api.zentrahub.pro');
    content = content.replace(/localhost:3000/g, 'api.zentrahub.pro');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file}`);
  }
});

// Create _redirects file for Cloudflare Pages
const redirects = `
# API redirects
/api/* https://api.zentrahub.pro/api/:splat 200

# SPA redirects
/*    /index.html   200
`;

fs.writeFileSync(path.join(distDir, '_redirects'), redirects.trim());
console.log('✅ Created _redirects file');

// Create _headers file for security
const headers = `
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;

fs.writeFileSync(path.join(distDir, '_headers'), headers.trim());
console.log('✅ Created _headers file');

console.log('\n✨ Build completed successfully!');
console.log('📁 Output directory: ./dist');
console.log('\n🚀 Ready to deploy to Cloudflare Pages!');