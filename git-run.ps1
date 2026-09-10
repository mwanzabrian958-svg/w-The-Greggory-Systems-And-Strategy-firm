$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Lydia mwanza\OneDrive\Desktop\personal projects\w-The-Greggory-Systems-And-Strategy-firm'

# Run git status
$status = & git --no-pager status 2>&1
$status | Out-File -FilePath 'C:\Users\Lydia mwanza\OneDrive\Desktop\personal projects\w-The-Greggory-Systems-And-Strategy-firm\status.txt' -Encoding utf8

# Run git log
$log = & git --no-pager log --oneline -5 2>&1
$log | Out-File -FilePath 'C:\Users\Lydia mwanza\OneDrive\Desktop\personal projects\w-The-Greggory-Systems-And-Strategy-firm\log.txt' -Encoding utf8

# Run git remote
$remote = & git --no-pager remote -v 2>&1
$remote | Out-File -FilePath 'C:\Users\Lydia mwanza\OneDrive\Desktop\personal projects\w-The-Greggory-Systems-And-Strategy-firm\remote.txt' -Encoding utf8

Write-Output 'Done'
