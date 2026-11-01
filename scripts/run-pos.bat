@echo off
title SwiftPOS - MERN Retail Point of Sale
color 0B

echo ======================================================================
echo           ⚡ SWIFTPOS - HIGH SPEED RETAIL CHECKOUT SYSTEM ⚡
echo                       Built on MERN Stack
echo ======================================================================
echo.

:: 1. Check if MongoDB is running or start it
echo [1/3] Checking MongoDB Service...
netstat -ano | find "27017" | find "LISTENING" >nul
if %errorlevel% neq 0 (
    echo [INFO] MongoDB is not running on port 27017.
    echo [INFO] Starting MongoDB with local database folder .\data\db...
    if not exist "data\db" mkdir "data\db"
    if exist "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" (
        start "" /min "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "%~dp0..\data\db" --port 27017 --bind_ip 127.0.0.1
    ) else (
        start "" /min mongod --dbpath "%~dp0..\data\db" --port 27017 --bind_ip 127.0.0.1
    )
    timeout /t 3 /nobreak >nul
) else (
    echo [OK] MongoDB is already active and listening on port 27017.
)

:: 2. Ensure frontend is built
echo [2/3] Checking Frontend Build...
if not exist "client\dist\index.html" (
    echo [INFO] Building React Client...
    cd client
    call npm run build
    cd ..
) else (
    echo [OK] Production client build is ready.
)

:: 3. Seed database if first time
echo [3/3] Checking Database Seed...
node server/seed/seeder.js

echo.
echo ======================================================================
echo   🎉 SWIFTPOS IS READY TO RUN!
echo.
echo   🌐 SINGLE LOCALHOST LINK:  http://localhost:5000
echo   🧭 MONGODB COMPASS URI:    mongodb://127.0.0.1:27017/pos_db
echo.
echo   Opening browser in 2 seconds...
echo ======================================================================
echo.

start http://localhost:5000
node server/server.js
pause
