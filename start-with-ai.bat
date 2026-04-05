@echo off
echo ========================================
echo Starting VSTRA with AI Search
echo ========================================
echo.

echo [1/2] Starting Python FastAPI Server...
start "Python API" cmd /k "cd Data && python api_fastapi.py"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Next.js Development Server...
start "Next.js Dev" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Python API: http://localhost:8000
echo Next.js App: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
