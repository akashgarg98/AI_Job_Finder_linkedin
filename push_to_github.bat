@echo off
echo ==========================================
echo    AI Job Finder - Git Push Helper
echo ==========================================
echo.

echo [1/3] Staging changes...
git add .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to stage changes.
    pause
    exit /b
)

echo [2/3] Committing changes...
git commit -m "Fix Gemini SDK integration and update model to gemini-flash-latest"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to commit changes.
    pause
    exit /b
)

echo [3/3] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo [ERROR] Failed to push to GitHub.
    pause
    exit /b
)

echo.
echo ==========================================
echo    SUCCESS: Code pushed to GitHub!
echo ==========================================
echo.
pause
