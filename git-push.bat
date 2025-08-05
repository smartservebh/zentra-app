@echo off
echo =====================================
echo Git Push Script for Zentra
echo =====================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo Git is installed. Starting operations...
echo.

REM Navigate to project directory
cd /d "c:\Users\PC\Downloads\zentra-app"

REM Initialize git repository
echo Step 1: Initializing Git repository...
git init
echo.

REM Add remote origin
echo Step 2: Adding remote repository...
git remote add origin https://github.com/smartservebh/zentra-app.git
echo.

REM Add all files
echo Step 3: Adding all files...
git add .
echo.

REM Commit
echo Step 4: Creating initial commit...
git commit -m "Initial Zentra upload"
echo.

REM Rename branch to main
echo Step 5: Renaming branch to main...
git branch -M main
echo.

REM Push to GitHub
echo Step 6: Pushing to GitHub...
echo Note: You may be asked for your GitHub credentials
echo.
git push -u origin main

echo.
echo =====================================
echo Operation completed!
echo =====================================
echo.
pause