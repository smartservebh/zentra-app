const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-deployment Check for Zentra\n');

// Check required files
const requiredFiles = [
  'package.json',
  'build.js',
  'wrangler.toml',
  'dist/_redirects',
  'dist/_headers',
  'dist/index.html'
];

let allGood = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allGood = false;
});

// Check dist folder
console.log('\n📂 Checking dist folder:');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`✅ Found ${files.length} files in dist/`);
  
  // Check for important files
  const importantFiles = ['index.html', 'styles', 'js', '_redirects', '_headers'];
  importantFiles.forEach(file => {
    const exists = fs.existsSync(path.join(distPath, file));
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  });
} else {
  console.log('❌ dist folder not found! Run: npm run build');
  allGood = false;
}

// Check package.json scripts
console.log('\n📜 Checking build script:');
const packageJson = require('./package.json');
if (packageJson.scripts && packageJson.scripts.build) {
  console.log(`✅ Build script found: ${packageJson.scripts.build}`);
} else {
  console.log('❌ Build script not found in package.json');
  allGood = false;
}

// Check Node version
console.log('\n🟢 Node.js version:');
console.log(`Current: ${process.version}`);
console.log(`Recommended: v18.x.x or higher`);

// Final result
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All checks passed! Ready for Cloudflare Pages deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. Push to GitHub: git push origin main');
  console.log('2. Go to Cloudflare Pages and connect your repo');
  console.log('3. Use these settings:');
  console.log('   - Build command: npm run build');
  console.log('   - Output directory: dist');
  console.log('   - NODE_VERSION: 18');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  console.log('\nIf dist/ is missing, run: npm run build');
}
console.log('='.repeat(50));