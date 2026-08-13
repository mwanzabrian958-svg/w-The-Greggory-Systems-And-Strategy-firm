@echo off
title The-Greggory-Systems-And-Strategy-firm - Starting...
echo ========================================
echo  The-Greggory-Systems-And-Strategy-firm - Dev Server
echo ========================================
echo.
echo Starting Backend (port 3000)...
start "GF Backend" cmd /k "cd /d "%~dp0" && node server.js"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend (port 5173)...
start "GF Frontend" cmd /k "cd /d "%~dp0" && npx vite"

echo.
echo ========================================
echo  Both servers are starting!
echo.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:3000/api
echo.
echo  Login: mwanzabrian4@gmail.com
echo  Pass:  ***REMOVED***
echo ========================================
echo.
pause
