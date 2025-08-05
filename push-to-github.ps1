# Push to GitHub Script
Write-Host "🚀 Pushing Zentra to GitHub..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check current directory
$currentDir = Get-Location
Write-Host "📁 Current directory: $currentDir" -ForegroundColor Yellow
Write-Host ""

# Check Git status
Write-Host "📊 Git Status:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Attempt to push
Write-Host "🔄 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "📝 Note: You may be asked for your GitHub credentials" -ForegroundColor Yellow
Write-Host "   Username: smartservebh" -ForegroundColor Gray
Write-Host "   Password: Use your Personal Access Token (NOT regular password)" -ForegroundColor Gray
Write-Host ""

# Execute push
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "🎉 View your repository at: https://github.com/smartservebh/zentra-app" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Please check the error message above." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Common solutions:" -ForegroundColor Yellow
    Write-Host "1. Create a Personal Access Token at: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "2. Use the token as your password (not your GitHub password)" -ForegroundColor White
    Write-Host "3. Make sure you have push access to the repository" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")