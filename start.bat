@echo off
title SahaySeva - Quick Start
cd /d "%~dp0"

echo ================================================
echo    SahaySeva - Community Support Service
echo ================================================
echo.

set "NODE_DIR=%~dp0.tools\node"
if exist "%NODE_DIR%\node.exe" (
  set "PATH=%NODE_DIR%;%PATH%"
  echo [1/5] Using bundled portable Node.js
) else (
  where node >nul 2>nul
  if errorlevel 1 (
    echo Node.js was not found.
    echo Either install Node.js from https://nodejs.org
    echo or keep the bundled .tools folder next to start.bat
    pause
    exit /b 1
  )
  echo [1/5] Using installed Node.js
)

if not exist "backend\node_modules" (
  echo [2/5] Installing backend dependencies ^(first run^)...
  pushd backend
  call npm install --no-audit --no-fund
  popd
) else (
  echo [2/5] Backend dependencies ready
)
if not exist "frontend\node_modules" (
  echo [3/5] Installing frontend dependencies ^(first run^)...
  pushd frontend
  call npm install --no-audit --no-fund
  popd
) else (
  echo [3/5] Frontend dependencies ready
)

if not exist ".data" mkdir ".data"

if exist ".tools\mongodb\bin\mongod.exe" (
  echo [4/5] Starting bundled MongoDB on port 27017...
  start "SahaySeva MongoDB" /min ".tools\mongodb\bin\mongod.exe" --dbpath "%~dp0.data\mongodb" --port 27017
  timeout /t 4 /nobreak >nul
) else (
  echo [4/5] Using MongoDB from MONGO_URI in backend\.env
  timeout /t 1 /nobreak >nul
)

if not exist ".data\seeded.flag" (
  echo       Seeding demo data...
  pushd backend
  call node seed\seeder.js
  popd
  type nul > ".data\seeded.flag"
)

echo [5/5] Starting API server and web app...
start "SahaySeva API" /min cmd /c "cd /d "%~dp0backend" && node server.js & pause"
start "SahaySeva Web" /min cmd /c "cd /d "%~dp0frontend" && npm run dev & pause"

timeout /t 6 /nobreak >nul
start http://localhost:5173

echo.
echo ================================================
echo   SahaySeva is running!
echo     Web app : http://localhost:5173
echo     API     : http://localhost:5000
echo.
echo   Login with a demo account, e.g.
echo     admin@sahayseva.com   / Admin@123
echo     ravi@sahayseva.com    / Password@123
echo     seva@sahayseva.com    / Password@123
echo.
echo   Close the opened windows to stop everything.
echo ================================================
pause
