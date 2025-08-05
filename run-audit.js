const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Starting Zentra Comprehensive Audit...\n');

const results = {
  npmInstall: false,
  build: false,
  eslint: false,
  prettier: false,
  brokenLinks: false,
  accessibility: false,
  lighthouse: false
};

// Step 1: npm ci
try {
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });
  results.npmInstall = true;
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.log('❌ npm install failed\n');
}

// Step 2: Build
try {
  console.log('🏗️  Building production...');
  execSync('npm run build', { stdio: 'inherit' });
  results.build = true;
  console.log('✅ Build successful\n');
} catch (error) {
  console.log('❌ Build failed\n');
}

// Step 3: ESLint
try {
  console.log('🔍 Running ESLint...');
  if (!fs.existsSync('.eslintrc.json')) {
    fs.writeFileSync('.eslintrc.json', JSON.stringify({
      "env": {
        "browser": true,
        "es2021": true,
        "node": true
      },
      "extends": "eslint:recommended",
      "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
      },
      "rules": {
        "semi": ["error", "always"]
      }
    }, null, 2));
  }
  execSync('npx eslint . --ext .js,.jsx --fix', { stdio: 'inherit' });
  results.eslint = true;
  console.log('✅ ESLint passed\n');
} catch (error) {
  console.log('⚠️  ESLint found issues (fixed what possible)\n');
  results.eslint = 'partial';
}

// Step 4: Prettier
try {
  console.log('💅 Running Prettier...');
  if (!fs.existsSync('.prettierrc.json')) {
    fs.writeFileSync('.prettierrc.json', JSON.stringify({
      "semi": true,
      "singleQuote": true,
      "printWidth": 80
    }, null, 2));
  }
  execSync('npx prettier --write .', { stdio: 'inherit' });
  results.prettier = true;
  console.log('✅ Prettier formatting complete\n');
} catch (error) {
  console.log('⚠️  Prettier formatting issues\n');
}

// Generate final report
const report = `
# 🎯 Audit Summary

| Task | Status |
|------|--------|
| npm install | ${results.npmInstall ? '✅' : '❌'} |
| Build | ${results.build ? '✅' : '❌'} |
| ESLint | ${results.eslint === true ? '✅' : results.eslint === 'partial' ? '⚠️' : '❌'} |
| Prettier | ${results.prettier ? '✅' : '❌'} |

## Next Steps:
${results.build ? '✅ Ready to deploy to Cloudflare Pages' : '❌ Fix build errors before deploying'}

Generated: ${new Date().toISOString()}
`;

fs.writeFileSync('AUDIT_SUMMARY.md', report);
console.log('📄 Audit report saved to AUDIT_SUMMARY.md');

// Exit with appropriate code
process.exit(results.build ? 0 : 1);