#Requires -RunAsAdministrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Greggory Foundation - Complete Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeInstalled = $null -ne (Get-Command node -ErrorAction SilentlyContinue)

if (-not $nodeInstalled) {
    Write-Host "Node.js is not installed. Attempting to install..." -ForegroundColor Yellow
    Write-Host ""
    
    # Try to install using winget
    try {
        Write-Host "Installing Node.js LTS using winget..." -ForegroundColor Green
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Wait a moment for installation
        Start-Sleep -Seconds 3
        
        # Check again
        $nodeInstalled = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
    } catch {
        Write-Host "Automatic installation failed. Please install Node.js manually from https://nodejs.org/" -ForegroundColor Red
        Write-Host "Press any key to open the download page..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Start-Process "https://nodejs.org/"
        exit 1
    }
}

if (-not $nodeInstalled) {
    Write-Host ""
    Write-Host "Node.js installation did not complete. Please install manually:" -ForegroundColor Red
    Write-Host "1. Go to https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. Download the LTS version" -ForegroundColor Yellow
    Write-Host "3. Run the installer" -ForegroundColor Yellow
    Write-Host "4. Restart this script" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Node.js is installed!" -ForegroundColor Green
node --version
npm --version
Write-Host ""

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "[1/2] Installing project dependencies..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup complete! Starting server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The website will open at http://localhost:5173/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev

Read-Host "Press Enter to exit"

