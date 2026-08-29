@echo off
REM Daily backup: production cloud DB -> local XAMPP DB (secondary backup)
REM Output is appended to %USERPROFILE%\greggory-backup.log
cd /d "c:\Users\Lydia mwanza\OneDrive\Desktop\personal projects\w-The-Greggory-Systems-And-Strategy-firm\The-Greggory-Systems-And-Strategy-firm website"
echo. >> "%USERPROFILE%\greggory-backup.log"
echo ===== %date% %time% ===== >> "%USERPROFILE%\greggory-backup.log"
"C:\Program Files\nodejs\node.exe" scripts\backup-cloud-to-local.js >> "%USERPROFILE%\greggory-backup.log" 2>&1