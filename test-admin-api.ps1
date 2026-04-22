# Test script to verify admin API is working
Write-Host "Testing Admin API..." -ForegroundColor Cyan

# Test 1: Health endpoint
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET -TimeoutSec 5
    Write-Host "   ✓ Health check passed: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Health check failed: $_" -ForegroundColor Red
}

# Test 2: Admin verification endpoint (with test data)
Write-Host "`n2. Testing admin authentication endpoint..." -ForegroundColor Yellow
$body = @{
    email = "test@test.com"
    password = "testpassword"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin-verification/authenticate-enhanced" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 5
    Write-Host "   ✓ Endpoint responded (login failed as expected for test credentials)" -ForegroundColor Green
    Write-Host "   Response: $($response.message)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "   ✓ Endpoint is working (returned 401 for invalid credentials)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Endpoint error: $_" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
