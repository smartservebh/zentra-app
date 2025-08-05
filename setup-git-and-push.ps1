# Git Setup and Push Script for Zentra

Write-Host "🔧 Git Setup for Zentra Project" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if Git is installed
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitPath) {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Please install Git first:" -ForegroundColor Yellow
    Write-Host "1. Download Git from: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Run the installer with default settings" -ForegroundColor White
    Write-Host "3. Restart this terminal after installation" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    
    # Offer to open Git download page
    $response = Read-Host "Would you like to open the Git download page? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Start-Process "https://git-scm.com/download/win"
    }
    
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host "✅ Git is installed at: $($gitPath.Path)" -ForegroundColor Green
Write-Host ""

# Navigate to project directory
$projectPath = "c:\Users\PC\Downloads\zentra-app"
Set-Location $projectPath
Write-Host "📁 Working directory: $projectPath" -ForegroundColor Cyan
Write-Host ""

# Function to run git command and check result
function Run-GitCommand {
    param($command, $description)
    
    Write-Host "🔄 $description..." -ForegroundColor Yellow
    Write-Host "   Command: git $command" -ForegroundColor Gray
    
    try {
        $output = Invoke-Expression "git $command" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Success!" -ForegroundColor Green
            if ($output) {
                Write-Host $output -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ Failed!" -ForegroundColor Red
            Write-Host $output -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
    return $true
}

# Check if .git already exists
if (Test-Path ".git") {
    Write-Host "⚠️  Git repository already initialized" -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove it and start fresh? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Remove-Item -Recurse -Force .git
        Write-Host "✅ Removed existing .git folder" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "Keeping existing repository..." -ForegroundColor Yellow
    }
}

# Execute Git commands
Write-Host "🚀 Starting Git operations..." -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# 1. Initialize repository
if (-not (Test-Path ".git")) {
    if (-not (Run-GitCommand "init" "Initializing Git repository")) {
        exit 1
    }
}

# 2. Add remote origin
# First check if remote exists
$remotes = git remote 2>$null
if ($remotes -contains "origin") {
    Write-Host "⚠️  Remote 'origin' already exists" -ForegroundColor Yellow
    if (-not (Run-GitCommand "remote remove origin" "Removing existing remote")) {
        Write-Host "Continuing anyway..." -ForegroundColor Yellow
    }
}

if (-not (Run-GitCommand "remote add origin https://github.com/smartservebh/zentra-app.git" "Adding remote repository")) {
    exit 1
}

# 3. Configure Git user (if not configured)
$userName = git config user.name 2>$null
$userEmail = git config user.email 2>$null

if (-not $userName -or -not $userEmail) {
    Write-Host "⚠️  Git user not configured" -ForegroundColor Yellow
    Write-Host "Please enter your Git credentials:" -ForegroundColor Yellow
    
    if (-not $userName) {
        $name = Read-Host "Enter your name"
        git config user.name "$name"
    }
    
    if (-not $userEmail) {
        $email = Read-Host "Enter your email"
        git config user.email "$email"
    }
    
    Write-Host "✅ Git user configured" -ForegroundColor Green
    Write-Host ""
}

# 4. Add all files
if (-not (Run-GitCommand "add ." "Adding all files to staging")) {
    exit 1
}

# Show status
Write-Host "📊 Git Status:" -ForegroundColor Cyan
git status --short
Write-Host ""

# 5. Commit
if (-not (Run-GitCommand 'commit -m "Initial Zentra upload"' "Creating initial commit")) {
    # Check if there's nothing to commit
    $status = git status --porcelain
    if (-not $status) {
        Write-Host "ℹ️  Nothing to commit, working tree clean" -ForegroundColor Blue
    } else {
        exit 1
    }
}

# 6. Rename branch to main
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    if (-not (Run-GitCommand "branch -M main" "Renaming branch to main")) {
        exit 1
    }
}

# 7. Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "This may ask for your GitHub credentials" -ForegroundColor Yellow
Write-Host ""

# Try to push
$pushResult = git push -u origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your project is now on GitHub at:" -ForegroundColor Cyan
    Write-Host "   https://github.com/smartservebh/zentra-app" -ForegroundColor White
} else {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host $pushResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Authentication required - You may need to:" -ForegroundColor White
    Write-Host "   - Use a Personal Access Token instead of password" -ForegroundColor Gray
    Write-Host "   - Create token at: https://github.com/settings/tokens" -ForegroundColor Gray
    Write-Host "2. Repository doesn't exist or you don't have access" -ForegroundColor White
    Write-Host "3. Network connection issues" -ForegroundColor White
    Write-Host ""
    Write-Host "Try running: git push -u origin main" -ForegroundColor Yellow
    Write-Host "manually after fixing the issue" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")