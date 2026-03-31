@echo off
echo ========================================
echo Starting Greggory Foundation Website
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Dependencies not installed. Running setup first...
    call setup-and-run.bat
    exit /b
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting development server...
echo The website will be available at http://localhost:5173/
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause

