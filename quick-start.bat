@echo off
echo ========================================
echo    Zentra - Quick Start Script
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed ✓

echo.
echo [2/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed ✓

echo.
echo [3/4] Checking MongoDB...
echo Please make sure MongoDB is running on localhost:27017
echo If not, start MongoDB before continuing.
pause

echo.
echo [4/4] Starting Zentra server...
echo.
echo ========================================
echo    Zentra is starting...
echo    Open http://localhost:3000 in your browser
echo ========================================
echo.

set PORT=3000
npm start