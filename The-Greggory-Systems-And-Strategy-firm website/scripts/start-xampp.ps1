# XAMPP Services Startup Script
# This script starts Apache and MySQL services in XAMPP

$xamppPath = "C:\xampp"
$apachePath = "$xamppPath\apache_start.bat"
$mysqlPath = "$xamppPath\mysql_start.bat"

Write-Host "Starting XAMPP Services..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if XAMPP is installed
if (-not (Test-Path $xamppPath)) {
    Write-Host "❌ XAMPP not found at $xamppPath" -ForegroundColor Red
    Write-Host "Please install XAMPP from: https://www.apachefriends.org/download.html" -ForegroundColor Yellow
    exit 1
}

# Function to check if service is running
function Is-ServiceRunning {
    param($serviceName)
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($service) {
        return $service.Status -eq 'Running'
    }
    return $false
}

# Function to start Apache
function Start-Apache {
    Write-Host "Starting Apache..." -ForegroundColor Yellow
    
    # Try to start Apache service
    if (Is-ServiceRunning "Apache2.4") {
        Write-Host "✅ Apache is already running" -ForegroundColor Green
        return $true
    }
    
    try {
        Start-Service -Name "Apache2.4" -ErrorAction Stop
        Start-Sleep -Seconds 2
        if (Is-ServiceRunning "Apache2.4") {
            Write-Host "✅ Apache started successfully" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "⚠️  Could not start Apache as service" -ForegroundColor Yellow
    }
    
    # Fallback: Try using batch file
    if (Test-Path $apachePath) {
        Write-Host "Starting Apache using batch file..." -ForegroundColor Yellow
        Start-Process -FilePath $apachePath -WindowStyle Hidden
        Start-Sleep -Seconds 3
        Write-Host "✅ Apache batch file executed" -ForegroundColor Green
        return $true
    }
    
    Write-Host "❌ Could not start Apache" -ForegroundColor Red
    Write-Host "Please start Apache manually from XAMPP Control Panel" -ForegroundColor Yellow
    return $false
}

# Function to start MySQL
function Start-MySQL {
    Write-Host "Starting MySQL..." -ForegroundColor Yellow
    
    # Try to start MySQL service
    if (Is-ServiceRunning "mysql") {
        Write-Host "✅ MySQL is already running" -ForegroundColor Green
        return $true
    }
    
    try {
        Start-Service -Name "mysql" -ErrorAction Stop
        Start-Sleep -Seconds 2
        if (Is-ServiceRunning "mysql") {
            Write-Host "✅ MySQL started successfully" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "⚠️  Could not start MySQL as service" -ForegroundColor Yellow
    }
    
    # Fallback: Try using batch file
    if (Test-Path $mysqlPath) {
        Write-Host "Starting MySQL using batch file..." -ForegroundColor Yellow
        Start-Process -FilePath $mysqlPath -WindowStyle Hidden
        Start-Sleep -Seconds 3
        Write-Host "✅ MySQL batch file executed" -ForegroundColor Green
        return $true
    }
    
    Write-Host "❌ Could not start MySQL" -ForegroundColor Red
    Write-Host "Please start MySQL manually from XAMPP Control Panel" -ForegroundColor Yellow
    return $false
}

# Start services
$apacheStarted = Start-Apache
$mysqlStarted = Start-MySQL

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "XAMPP Services Status:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Apache:  $(if ($apacheStarted) { '✅ Running' } else { '❌ Not Running' })" -ForegroundColor $(if ($apacheStarted) { 'Green' } else { 'Red' })
Write-Host "MySQL:   $(if ($mysqlStarted) { '✅ Running' } else { '❌ Not Running' })" -ForegroundColor $(if ($mysqlStarted) { 'Green' } else { 'Red' })
Write-Host "================================" -ForegroundColor Cyan

if ($apacheStarted -and $mysqlStarted) {
    Write-Host "✅ All XAMPP services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access URLs:" -ForegroundColor Cyan
    Write-Host "  Apache:    http://localhost" -ForegroundColor White
    Write-Host "  phpMyAdmin: http://localhost/phpmyadmin" -ForegroundColor White
    exit 0
} else {
    Write-Host "⚠️  Some services failed to start" -ForegroundColor Yellow
    Write-Host "Please start them manually from XAMPP Control Panel" -ForegroundColor Yellow
    exit 1
}
