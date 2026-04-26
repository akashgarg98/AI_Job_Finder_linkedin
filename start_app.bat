@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    AI Job Finder - Startup Assistant
echo ==========================================
echo.

:: Check if Node is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your PATH. Please install Node.js!
    pause
    exit /b
)

echo [1/2] Launching Backend...
cd /d "%~dp0backend"
if not exist node_modules (
    echo [INFO] node_modules missing in backend. Running npm install...
    start "Backend Install" cmd /c "npm install && echo Install complete! && pause"
)
start "Backend Server" cmd /k "npm run dev || (echo Backend failed to start! && pause)"

echo [2/2] Launching Frontend...
cd /d "%~dp0frontend"
if not exist node_modules (
    echo [INFO] node_modules missing in frontend. Running npm install...
    start "Frontend Install" cmd /c "npm install && echo Install complete! && pause"
)
start "Frontend Server" cmd /k "npm run dev || (echo Frontend failed to start! && pause)"

echo.
echo ------------------------------------------
echo TWO NEW WINDOWS SHOULD HAVE OPENED.
echo 1. Wait for the "Ready" message in the Frontend window.
echo 2. Open http://localhost:3000 in your browser.
echo ------------------------------------------
echo.
pause
