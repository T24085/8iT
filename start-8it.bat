@echo off
setlocal

cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo Node.js and npm are required to run the 8iT website.
  pause
  exit /b 1
)

echo Starting the 8iT website at http://localhost:4174/
npm run dev -- --host 0.0.0.0 --port 4174

pause
