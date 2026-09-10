@echo off
cd /d "C:\Users\Lydia mwanza\OneDrive\Desktop\personal projects\w-The-Greggory-Systems-And-Strategy-firm"
echo === GIT STATUS ===
git --no-pager status
echo === GIT LOG ===
git --no-pager log --oneline -5
echo === GIT REMOTE ===
git --no-pager remote -v
echo === ADDING FILES ===
git add -A
echo === COMMITTING ===
git commit -m "Add helper scripts"
echo === PUSHING ===
git push origin main
echo === DONE ===
