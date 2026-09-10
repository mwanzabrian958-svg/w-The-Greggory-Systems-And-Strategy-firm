@echo off
cd /d "C:\Users\Lydia mwanza\OneDrive\Desktop\personal projects\w-The-Greggory-Systems-And-Strategy-firm"
git --no-pager status > status.txt 2>&1
git --no-pager log --oneline -5 > log.txt 2>&1
git --no-pager remote -v > remote.txt 2>&1
echo Done
