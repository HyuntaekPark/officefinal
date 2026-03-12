@echo off
setlocal

cd /d "%~dp0"
title KSA Office Hour Finder

echo ================================
echo KSA Office Hour Finder Launcher
echo ================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js/npm is not installed or not added to PATH.
  echo Install Node.js first, then run this file again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    echo.
    pause
    exit /b 1
  )
)

echo Starting KSA Office Hour Finder...
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Keep this window open while the app is running.
echo Close this window to stop the app.
echo.

call npm run dev

echo.
echo The application has stopped.
pause

endlocal
