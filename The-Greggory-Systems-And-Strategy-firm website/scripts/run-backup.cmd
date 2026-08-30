@echo off
REM Windows Task Scheduler entry point for the cloud -> local (phpMyAdmin) backup.
REM Logs go to backups\last-backup.log ; machine-readable result to backups\last-backup-status.json
cd /d "C:\Users\Lydia mwanza\OneDrive\Desktop\personal projects\w-The-Greggory-Systems-And-Strategy-firm\The-Greggory-Systems-And-Strategy-firm website"
set BACKUP_TRIGGER=scheduler
echo ===== run started %date% %time% ===== >> backups\last-backup.log
"C:\Program Files\nodejs\node.exe" scripts\backup-cloud-to-local.js >> backups\last-backup.log 2>&1
echo ===== run exited with code %ERRORLEVEL% ===== >> backups\last-backup.log
