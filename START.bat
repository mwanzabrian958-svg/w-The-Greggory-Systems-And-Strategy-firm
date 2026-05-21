@echo off
title Greggory Foundation - Starting...
echo ========================================
echo  Greggory Foundation Ltd - Dev Server
echo ========================================
echo.
echo Starting Backend (port 8080)...
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
echo  Backend:  http://localhost:8080/api
echo.
echo  Login: mwanzabrian4@gmail.com
echo  Pass:  ***REMOVED***
echo ========================================
echo.
pause
