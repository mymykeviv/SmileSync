@echo off
setlocal enabledelayedexpansion

REM SmileSync Application Stop Script
REM Version: 1.0.0
REM Description: Stops the SmileSync frontend and backend services

echo ========================================
echo Stopping SmileSync Application
echo ========================================
echo.

REM Set application directory
set "APP_DIR=C:\SmileSync"
set "LOG_DIR=%APP_DIR%\logs"
set "STOP_LOG=%LOG_DIR%\stop.log"

REM Create logs directory if it doesn't exist
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo Stop process started at %date% %time% > "%STOP_LOG%"

echo Checking for running SmileSync processes...

REM Check for Node.js processes
tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find "node.exe" >nul
if errorlevel 1 (
    echo No Node.js processes found
    echo No Node.js processes found >> "%STOP_LOG%"
) else (
    echo Found running Node.js processes
    echo Found running Node.js processes >> "%STOP_LOG%"
    
    REM List running Node.js processes
    echo Current Node.js processes:
    tasklist /FI "IMAGENAME eq node.exe" /FO TABLE
    
    echo.
    echo Stopping Node.js processes...
    
    REM Gracefully stop Node.js processes
    taskkill /IM node.exe /T >nul 2>&1
    
    REM Wait a moment for graceful shutdown
    timeout /t 3 >nul
    
    REM Force kill if still running
    tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find "node.exe" >nul
    if not errorlevel 1 (
        echo Force stopping remaining processes...
        taskkill /F /IM node.exe /T >nul 2>&1
        echo Force stopped Node.js processes >> "%STOP_LOG%"
    ) else (
        echo Node.js processes stopped gracefully >> "%STOP_LOG%"
    )
)

REM Check for any remaining processes on SmileSync ports
echo Checking for processes on SmileSync ports...

REM Check port 3000 (frontend)
netstat -ano | find ":3000" >nul
if not errorlevel 1 (
    echo WARNING: Port 3000 is still in use
    echo Port 3000 still in use >> "%STOP_LOG%"
    for /f "tokens=5" %%a in ('netstat -ano ^| find ":3000"') do (
        echo Stopping process %%a on port 3000...
        taskkill /F /PID %%a >nul 2>&1
    )
) else (
    echo Port 3000 is free
    echo Port 3000 is free >> "%STOP_LOG%"
)

REM Check port 5001 (backend)
netstat -ano | find ":5001" >nul
if not errorlevel 1 (
    echo WARNING: Port 5001 is still in use
    echo Port 5001 still in use >> "%STOP_LOG%"
    for /f "tokens=5" %%a in ('netstat -ano ^| find ":5001"') do (
        echo Stopping process %%a on port 5001...
        taskkill /F /PID %%a >nul 2>&1
    )
) else (
    echo Port 5001 is free
    echo Port 5001 is free >> "%STOP_LOG%"
)

REM Clean up temporary files
echo Cleaning up temporary files...
if exist "%APP_DIR%\backend\*.tmp" del /Q "%APP_DIR%\backend\*.tmp" >nul 2>&1
if exist "%APP_DIR%\app\*.tmp" del /Q "%APP_DIR%\app\*.tmp" >nul 2>&1

echo Cleanup completed >> "%STOP_LOG%"

REM Final verification
echo.
echo Verifying shutdown...
tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find "node.exe" >nul
if errorlevel 1 (
    echo ✓ All SmileSync processes stopped successfully
    echo All processes stopped successfully >> "%STOP_LOG%"
) else (
    echo ⚠ Some Node.js processes may still be running
    echo Some processes may still be running >> "%STOP_LOG%"
    echo Please check manually if needed:
    tasklist /FI "IMAGENAME eq node.exe" /FO TABLE
)

netstat -an | find ":3000" >nul
if errorlevel 1 (
    echo ✓ Port 3000 (frontend) is free
) else (
    echo ⚠ Port 3000 (frontend) is still in use
)

netstat -an | find ":5001" >nul
if errorlevel 1 (
    echo ✓ Port 5001 (backend) is free
) else (
    echo ⚠ Port 5001 (backend) is still in use
)

echo.
echo ========================================
echo SmileSync Application Stopped
echo ========================================
echo.
echo Stop process completed at %date% %time% >> "%STOP_LOG%"
echo Log file: %STOP_LOG%
echo.
echo To restart SmileSync, run start-application.bat
echo or double-click the desktop shortcut.
echo.

pause
exit /b 0