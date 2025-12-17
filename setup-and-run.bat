@echo off
echo ========================================
echo Greggory Foundation Website Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo Download the LTS version and run the installer.
    echo.
    echo After installing Node.js, restart this script.
    pause
    exit /b 1
)

echo [1/2] Checking Node.js version...
node --version
npm --version
echo.

echo [2/2] Installing project dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup complete! Starting server...
echo ========================================
echo.
echo The website will open at http://localhost:5173/
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause

