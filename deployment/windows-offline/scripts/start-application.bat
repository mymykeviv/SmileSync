@echo off
setlocal enabledelayedexpansion

REM SmileSync Application Startup Script
REM Version: 1.0.0
REM Description: Starts the SmileSync frontend and backend services

echo ========================================
echo Starting SmileSync Application
echo ========================================
echo.

REM Set application directory
set "APP_DIR=C:\SmileSync"
set "LOG_DIR=%APP_DIR%\logs"
set "BACKEND_LOG=%LOG_DIR%\backend.log"
set "FRONTEND_LOG=%LOG_DIR%\frontend.log"

REM Create logs directory if it doesn't exist
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please ensure Node.js is properly installed
    pause
    exit /b 1
)

REM Check if application directory exists
if not exist "%APP_DIR%" (
    echo ERROR: SmileSync is not installed in %APP_DIR%
    echo Please run the installer first
    pause
    exit /b 1
)

REM Change to application directory
cd /d "%APP_DIR%"

echo Checking for running instances...

REM Kill any existing Node.js processes (SmileSync related)
tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find "node.exe" >nul
if not errorlevel 1 (
    echo Stopping existing SmileSync processes...
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 2 >nul
)

echo Starting backend service...
echo Backend started at %date% %time% > "%BACKEND_LOG%"

REM Start backend in background
start /B "SmileSync Backend" cmd /c "cd /d %APP_DIR%\backend && set PORT=5001 && node server.js >> %BACKEND_LOG% 2>&1"

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 >nul

REM Check if backend is running
netstat -an | find ":5001" >nul
if errorlevel 1 (
    echo WARNING: Backend may not have started properly
    echo Check %BACKEND_LOG% for details
) else (
    echo Backend service started successfully on port 5001
)

echo Starting frontend service...
echo Frontend started at %date% %time% > "%FRONTEND_LOG%"

REM Start frontend in background
start /B "SmileSync Frontend" cmd /c "cd /d %APP_DIR%\app && set BROWSER=none && npm start >> %FRONTEND_LOG% 2>&1"

REM Wait for frontend to start
echo Waiting for frontend to initialize...
timeout /t 10 >nul

REM Check if frontend is running
netstat -an | find ":3000" >nul
if errorlevel 1 (
    echo WARNING: Frontend may not have started properly
    echo Check %FRONTEND_LOG% for details
) else (
    echo Frontend service started successfully on port 3000
)

echo.
echo ========================================
echo SmileSync Application Started
echo ========================================
echo.
echo Services Status:
echo - Backend API: http://localhost:5001
echo - Frontend App: http://localhost:3000
echo.
echo Log Files:
echo - Backend: %BACKEND_LOG%
echo - Frontend: %FRONTEND_LOG%
echo.
echo Default Login Credentials:
echo - Admin: admin / admin123
echo - Dentist: drsmith / dentist123
echo - Staff: staff / staff123
echo.

REM Open browser automatically
echo Opening SmileSync in your default browser...
timeout /t 3 >nul
start "" "http://localhost:3000"

echo.
echo SmileSync is now running!
echo To stop the application, close this window or run stop-application.bat
echo.
echo Press any key to view application logs (Ctrl+C to exit)...
pause >nul

REM Show live logs
echo.
echo ========================================
echo Live Application Logs
echo ========================================
echo Press Ctrl+C to stop viewing logs
echo.

REM Display logs in real-time (simplified version)
:LOGLOOP
if exist "%BACKEND_LOG%" (
    echo --- Backend Log (last 5 lines) ---
    powershell -command "Get-Content '%BACKEND_LOG%' -Tail 5"
)
if exist "%FRONTEND_LOG%" (
    echo --- Frontend Log (last 5 lines) ---
    powershell -command "Get-Content '%FRONTEND_LOG%' -Tail 5"
)
echo.
timeout /t 10 >nul
goto LOGLOOP