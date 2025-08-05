# Zentra Quick Start Script for PowerShell

Write-Host "========================================"
Write-Host "   Zentra - Quick Start Script"
Write-Host "========================================"
Write-Host ""

# Check Node.js
Write-Host "[1/4] Checking Node.js installation..."
try {
    $nodeVersion = node --version
    Write-Host "Node.js is installed ✓ (Version: $nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Dependencies installed ✓" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] MongoDB Check" -ForegroundColor Yellow
Write-Host "Please make sure MongoDB is running on localhost:27017"
Write-Host "If not, start MongoDB before continuing."
Read-Host "Press Enter to continue"

Write-Host ""
Write-Host "[4/4] Starting Zentra server..."
Write-Host ""
Write-Host "========================================"
Write-Host "   Zentra is starting..."
Write-Host "   Open http://localhost:3000 in your browser"
Write-Host "========================================"
Write-Host ""

# Set environment variable and start
$env:PORT = "3000"
npm start