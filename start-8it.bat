@echo off
setlocal

title 8iT Website

cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo.
  echo Node.js and npm are required to run the 8iT website.
  echo Download Node.js from https://nodejs.org/ and try again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing website dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting the 8iT website at http://localhost:4174/
echo Keep this window open while you work. Press Ctrl+C to stop the server.
echo.

start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:4174/'"
call npm run dev -- --host 0.0.0.0 --port 4174

echo.
pause
