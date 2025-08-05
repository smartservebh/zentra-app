@echo off
echo Cleaning NPM cache...
echo.

:: Kill any node processes that might be locking files
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

:: Remove _npx folder
echo Removing _npx cache folder...
rd /s /q "%USERPROFILE%\AppData\Local\npm-cache\_npx" 2>nul
rmdir /s /q "%USERPROFILE%\AppData\Local\npm-cache\_npx" 2>nul

:: Clean npm cache
echo Cleaning npm cache...
call npm cache clean --force

:: Remove node_modules/.cache if exists
if exist "node_modules\.cache" (
    echo Removing node_modules cache...
    rd /s /q "node_modules\.cache" 2>nul
)

echo.
echo ✅ NPM cache cleaned successfully!
echo.
pause