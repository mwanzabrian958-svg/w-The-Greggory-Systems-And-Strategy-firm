# XAMPP Project Setup Script for Greggory Foundation Ltd
# This script automates the complete setup process

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  XAMPP PROJECT SETUP - Greggory Foundation Ltd" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if XAMPP is installed
$xamppPath = "C:\xampp"
if (-not (Test-Path $xamppPath)) {
    Write-Host "❌ XAMPP not found at $xamppPath" -ForegroundColor Red
    Write-Host "Please install XAMPP from: https://www.apachefriends.org/download.html" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ XAMPP found at $xamppPath" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STEP 1: Installing Dependencies" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STEP 2: Checking .env File" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please review and update .env with your settings" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STEP 3: Starting XAMPP Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "Please ensure XAMPP Control Panel is running:" -ForegroundColor Yellow
Write-Host "1. Open XAMPP Control Panel" -ForegroundColor Yellow
Write-Host "2. Click 'Start' next to Apache" -ForegroundColor Yellow
Write-Host "3. Click 'Start' next to MySQL" -ForegroundColor Yellow
Write-Host ""

$ready = Read-Host "Have you started Apache and MySQL? (Y/N)"
if ($ready -ne "Y" -and $ready -ne "y") {
    Write-Host "Please start XAMPP services and run this script again" -ForegroundColor Yellow
    exit 0
}

Write-Host "✅ XAMPP services assumed running" -ForegroundColor Green

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STEP 4: Checking Database Connection" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

if (Test-Path "test-db-connection.js") {
    Write-Host "Testing database connection..." -ForegroundColor Yellow
    node test-db-connection.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Database connection failed" -ForegroundColor Red
        Write-Host "Please ensure:" -ForegroundColor Yellow
        Write-Host "  - MySQL is running in XAMPP" -ForegroundColor Yellow
        Write-Host "  - Database credentials in .env are correct" -ForegroundColor Yellow
        Write-Host "  - Database exists in phpMyAdmin" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To create the database, open phpMyAdmin:" -ForegroundColor Cyan
        Write-Host "  http://localhost/phpmyadmin" -ForegroundColor Cyan
        Write-Host "And import: database/greggory_foundation_db_main.sql" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Database connection successful" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  test-db-connection.js not found, skipping connection test" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STEP 5: Creating Backups Directory" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

if (-not (Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" -Force | Out-Null
    Write-Host "✅ Backups directory created" -ForegroundColor Green
} else {
    Write-Host "✅ Backups directory exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STEP 6: Initial Database Backup (Optional)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$backup = Read-Host "Do you want to create an initial database backup? (Y/N)"
if ($backup -eq "Y" -or $backup -eq "y") {
    if (Test-Path "scripts\backup-db-github.js") {
        Write-Host "Creating database backup..." -ForegroundColor Yellow
        node scripts\backup-db-github.js
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database backup created" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Backup failed, but setup can continue" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Backup script not found" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your project is ready to use!" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Start:" -ForegroundColor Cyan
Write-Host "  1. Start XAMPP (Apache + MySQL)" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "  phpMyAdmin: http://localhost/phpmyadmin" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  XAMPP Setup Guide: XAMPP-SETUP-GUIDE.md" -ForegroundColor White
Write-Host "  API Endpoints: ENDPOINTS-GUIDE.md" -ForegroundColor White
Write-Host "  Deployment: DEPLOYMENT-GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "Database Backup:" -ForegroundColor Cyan
Write-Host "  Backup:   node scripts\backup-db-github.js" -ForegroundColor White
Write-Host "  Restore:  node scripts\restore-db-github.js" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "IMPORTANT: Commit your setup to GitHub for safety!" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m 'Initial XAMPP setup'" -ForegroundColor White
Write-Host "  git push" -ForegroundColor White
Write-Host ""
Write-Host "This ensures your data is safe even if your PC is lost or corrupted." -ForegroundColor Yellow
Write-Host ""
