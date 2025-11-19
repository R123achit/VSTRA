@echo off
echo ========================================
echo    VSTRA Full-Stack Ecommerce Setup
echo ========================================
echo.

echo [1/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found

echo.
echo [2/4] Installing dependencies...
echo This may take a few minutes...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [3/4] Checking MongoDB...
echo.
echo MongoDB is required for this application.
echo.
echo Option 1: Install MongoDB locally
echo   - Download from: https://www.mongodb.com/try/download/community
echo   - Or use: winget install MongoDB.Server
echo.
echo Option 2: Use MongoDB Atlas (Cloud)
echo   - Sign up at: https://www.mongodb.com/cloud/atlas
echo   - Get connection string
echo   - Update .env.local file
echo.

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Make sure MongoDB is running
echo    - Local: Run 'mongod' in another terminal
echo    - Cloud: Update MONGODB_URI in .env.local
echo.
echo 2. Start the development server:
echo    npm run dev
echo.
echo 3. Seed the database (in browser):
echo    http://localhost:3000/api/seed
echo.
echo 4. Login with demo account:
echo    Email: admin@vstra.com
echo    Password: admin123
echo.
echo ========================================
echo.
pause
