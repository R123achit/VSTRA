@echo off
echo ========================================
echo    VSTRA Landing Page - Quick Start
echo ========================================
echo.

echo [1/3] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found

echo.
echo [2/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [3/3] Starting development server...
echo.
echo ========================================
echo   VSTRA is starting...
echo   Open: http://localhost:3000
echo ========================================
echo.

call npm run dev
