# Production Deployment Script for Zentra
Write-Host "🚀 Zentra Production Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Not in the Zentra project directory!" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Working directory: $currentDir" -ForegroundColor Yellow
Write-Host ""

# Step 1: Remove sensitive files
Write-Host "🔒 Removing sensitive files..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Remove-Item ".env" -Force
    Write-Host "✅ Removed .env file" -ForegroundColor Green
}

# Step 2: Build the project
Write-Host ""
Write-Host "🏗️  Building project for production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Step 3: Commit changes
Write-Host ""
Write-Host "📝 Committing production-ready code..." -ForegroundColor Yellow
git add .
git commit -m "Production deployment - removed sensitive data"

# Step 4: Push to GitHub
Write-Host ""
Write-Host "🔄 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Note: You'll need to authenticate with your Personal Access Token" -ForegroundColor Gray
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to Cloudflare Pages: https://dash.cloudflare.com/pages" -ForegroundColor White
    Write-Host "2. Create a new project and connect to: https://github.com/smartservebh/zentra-app" -ForegroundColor White
    Write-Host "3. Use these build settings:" -ForegroundColor White
    Write-Host "   - Build command: npm run build" -ForegroundColor Gray
    Write-Host "   - Output directory: dist" -ForegroundColor Gray
    Write-Host "   - Node version: 18" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📌 Your app will be live at: https://zentrahub.pro" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Please check your credentials and try again." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")