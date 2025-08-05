@echo off
echo ========================================
echo Force Clean NPM Cache and Install Mongosh
echo ========================================
echo.

:: Request admin privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges...
) else (
    echo This script requires Administrator privileges!
    echo Please run as Administrator.
    pause
    exit /b 1
)

echo.
echo Step 1: Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul
taskkill /F /IM npx.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo Step 2: Removing NPM cache directories...
:: Remove _npx folder
echo Removing _npx folder...
takeown /f "%USERPROFILE%\AppData\Local\npm-cache\_npx" /r /d y >nul 2>&1
icacls "%USERPROFILE%\AppData\Local\npm-cache\_npx" /grant administrators:F /t >nul 2>&1
rd /s /q "%USERPROFILE%\AppData\Local\npm-cache\_npx" 2>nul
rmdir /s /q "%USERPROFILE%\AppData\Local\npm-cache\_npx" 2>nul

:: Remove entire npm-cache if needed
echo Removing npm-cache folder...
takeown /f "%USERPROFILE%\AppData\Local\npm-cache" /r /d y >nul 2>&1
icacls "%USERPROFILE%\AppData\Local\npm-cache" /grant administrators:F /t >nul 2>&1
rd /s /q "%USERPROFILE%\AppData\Local\npm-cache" 2>nul

:: Also clean npm cache
echo Cleaning npm cache...
call npm cache clean --force >nul 2>&1

echo.
echo Step 3: Installing mongosh globally...
call npm install -g mongosh

echo.
echo Step 4: Verifying installation...
mongosh --version

echo.
echo ========================================
if %errorLevel% == 0 (
    echo ✅ MongoDB Shell installed successfully!
    echo.
    echo You can now use:
    echo   mongosh                    - Connect to local MongoDB
    echo   mongosh [connection-string] - Connect to remote MongoDB
) else (
    echo ❌ Installation failed. Please try manually:
    echo   1. Close all applications
    echo   2. Restart your computer
    echo   3. Run: npm install -g mongosh
)
echo ========================================
echo.
pause