# SwiftPOS PowerShell Runner
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          ⚡ SWIFTPOS - HIGH SPEED RETAIL CHECKOUT SYSTEM ⚡" -ForegroundColor Yellow
Write-Host "                      Strictly MERN Stack" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot

# 1. Check MongoDB
Write-Host "[1/3] Checking MongoDB connection..." -ForegroundColor White
$mongoRunning = (Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue)

if (-not $mongoRunning) {
    Write-Host "[INFO] Starting local MongoDB instance..." -ForegroundColor Yellow
    $dbDir = Join-Path $projectRoot "data\db"
    if (-not (Test-Path $dbDir)) { New-Item -ItemType Directory -Path $dbDir -Force | Out-Null }
    
    $mongoBin = "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe"
    if (-not (Test-Path $mongoBin)) { $mongoBin = "mongod" }
    
    Start-Process -FilePath $mongoBin -ArgumentList "--dbpath `"$dbDir`" --port 27017 --bind_ip 127.0.0.1" -WindowStyle Hidden
    Start-Sleep -Seconds 3
} else {
    Write-Host "[OK] MongoDB is already active on port 27017." -ForegroundColor Green
}

# 2. Check Build
Write-Host "[2/3] Checking Production React Client..." -ForegroundColor White
$distIndex = Join-Path $projectRoot "client\dist\index.html"
if (-not (Test-Path $distIndex)) {
    Write-Host "[INFO] Building React Client frontend..." -ForegroundColor Yellow
    Push-Location (Join-Path $projectRoot "client")
    npm run build
    Pop-Location
} else {
    Write-Host "[OK] Client production build is present." -ForegroundColor Green
}

# 3. Seed Database
Write-Host "[3/3] Seeding Initial Products to MongoDB pos_db..." -ForegroundColor White
Push-Location $projectRoot
node server/seed/seeder.js

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  🎉 SWIFTPOS IS STARTING!" -ForegroundColor Yellow
Write-Host "  🌐 SINGLE LOCALHOST LINK:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "  🧭 MONGODB COMPASS URI:    mongodb://127.0.0.1:27017/pos_db" -ForegroundColor Magenta
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""

# Launch Browser
Start-Process "http://localhost:5000"

# Start Node/Express Server
node server/server.js
