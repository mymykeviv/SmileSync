@echo off
setlocal enabledelayedexpansion

REM SmileSync System Check Script
REM Version: 1.0.0
REM Description: Performs system diagnostics and health checks for SmileSync

echo ========================================
echo SmileSync System Check Utility
echo ========================================
echo.

REM Set directories
set "APP_DIR=C:\SmileSync"
set "DATA_DIR=%APP_DIR%\data"
set "LOG_DIR=%APP_DIR%\logs"
set "CHECK_LOG=%LOG_DIR%\system-check_%date:~-4,4%%date:~-10,2%%date:~-7,2%.log"

REM Create logs directory if it doesn't exist
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Start logging
echo System check started at %date% %time% > "%CHECK_LOG%"
echo ======================================== >> "%CHECK_LOG%"
echo. >> "%CHECK_LOG%"

echo Starting comprehensive system check...
echo.

REM Check 1: System Information
echo [1/12] System Information
echo ========================
echo [1/12] System Information >> "%CHECK_LOG%"

echo Computer Name: %COMPUTERNAME%
echo Computer Name: %COMPUTERNAME% >> "%CHECK_LOG%"

echo User: %USERNAME%
echo User: %USERNAME% >> "%CHECK_LOG%"

for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo Windows Version: %VERSION%
echo Windows Version: %VERSION% >> "%CHECK_LOG%"

echo System Architecture: %PROCESSOR_ARCHITECTURE%
echo System Architecture: %PROCESSOR_ARCHITECTURE% >> "%CHECK_LOG%"
echo.

REM Check 2: Node.js Installation
echo [2/12] Node.js Installation
echo ===========================
echo [2/12] Node.js Installation >> "%CHECK_LOG%"

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js: NOT INSTALLED
    echo ERROR: Node.js not found >> "%CHECK_LOG%"
    set "NODE_OK=0"
) else (
    for /f "delims=" %%i in ('node --version 2^>nul') do set "NODE_VERSION=%%i"
    echo ✓ Node.js: !NODE_VERSION!
    echo Node.js version: !NODE_VERSION! >> "%CHECK_LOG%"
    set "NODE_OK=1"
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm: NOT AVAILABLE
    echo ERROR: npm not found >> "%CHECK_LOG%"
) else (
    for /f "delims=" %%i in ('npm --version 2^>nul') do set "NPM_VERSION=%%i"
    echo ✓ npm: !NPM_VERSION!
    echo npm version: !NPM_VERSION! >> "%CHECK_LOG%"
)
echo.

REM Check 3: Application Directory Structure
echo [3/12] Application Directory Structure
echo ======================================
echo [3/12] Application Directory Structure >> "%CHECK_LOG%"

if exist "%APP_DIR%" (
    echo ✓ Main directory: %APP_DIR%
    echo Main directory exists >> "%CHECK_LOG%"
) else (
    echo ❌ Main directory: %APP_DIR% NOT FOUND
    echo ERROR: Main directory not found >> "%CHECK_LOG%"
    set "STRUCTURE_OK=0"
)

if exist "%APP_DIR%\app" (
    echo ✓ Frontend directory: %APP_DIR%\app
    echo Frontend directory exists >> "%CHECK_LOG%"
) else (
    echo ❌ Frontend directory: NOT FOUND
    echo ERROR: Frontend directory not found >> "%CHECK_LOG%"
    set "STRUCTURE_OK=0"
)

if exist "%APP_DIR%\backend" (
    echo ✓ Backend directory: %APP_DIR%\backend
    echo Backend directory exists >> "%CHECK_LOG%"
) else (
    echo ❌ Backend directory: NOT FOUND
    echo ERROR: Backend directory not found >> "%CHECK_LOG%"
    set "STRUCTURE_OK=0"
)

if exist "%DATA_DIR%" (
    echo ✓ Data directory: %DATA_DIR%
    echo Data directory exists >> "%CHECK_LOG%"
) else (
    echo ❌ Data directory: NOT FOUND
    echo ERROR: Data directory not found >> "%CHECK_LOG%"
)
echo.

REM Check 4: Database
echo [4/12] Database Status
echo ====================
echo [4/12] Database Status >> "%CHECK_LOG%"

if exist "%DATA_DIR%\smilesync.db" (
    echo ✓ Database file: %DATA_DIR%\smilesync.db
    echo Database file exists >> "%CHECK_LOG%"
    
    REM Get database file size
    for %%A in ("%DATA_DIR%\smilesync.db") do set "DB_SIZE=%%~zA"
    echo   File size: !DB_SIZE! bytes
    echo   Database size: !DB_SIZE! bytes >> "%CHECK_LOG%"
    
    REM Check if database is accessible (basic check)
    if !DB_SIZE! gtr 0 (
        echo ✓ Database appears to be valid (size > 0)
        echo Database appears valid >> "%CHECK_LOG%"
    ) else (
        echo ❌ Database file is empty
        echo WARNING: Database file is empty >> "%CHECK_LOG%"
    )
) else (
    echo ❌ Database file: NOT FOUND
    echo ERROR: Database file not found >> "%CHECK_LOG%"
)
echo.

REM Check 5: Dependencies
echo [5/12] Dependencies Check
echo =========================
echo [5/12] Dependencies Check >> "%CHECK_LOG%"

if exist "%APP_DIR%\node_modules" (
    echo ✓ Root dependencies: Installed
    echo Root dependencies installed >> "%CHECK_LOG%"
) else (
    echo ❌ Root dependencies: NOT FOUND
    echo ERROR: Root dependencies not found >> "%CHECK_LOG%"
)

if exist "%APP_DIR%\app\node_modules" (
    echo ✓ Frontend dependencies: Installed
    echo Frontend dependencies installed >> "%CHECK_LOG%"
) else (
    echo ❌ Frontend dependencies: NOT FOUND
    echo ERROR: Frontend dependencies not found >> "%CHECK_LOG%"
)

if exist "%APP_DIR%\backend\node_modules" (
    echo ✓ Backend dependencies: Installed
    echo Backend dependencies installed >> "%CHECK_LOG%"
) else (
    echo ❌ Backend dependencies: NOT FOUND
    echo ERROR: Backend dependencies not found >> "%CHECK_LOG%"
)
echo.

REM Check 6: Port Availability
echo [6/12] Port Availability
echo =========================
echo [6/12] Port Availability >> "%CHECK_LOG%"

netstat -an | find ":3000" >nul
if errorlevel 1 (
    echo ✓ Port 3000 (Frontend): Available
    echo Port 3000 available >> "%CHECK_LOG%"
) else (
    echo ⚠ Port 3000 (Frontend): In use
    echo WARNING: Port 3000 in use >> "%CHECK_LOG%"
)

netstat -an | find ":5001" >nul
if errorlevel 1 (
    echo ✓ Port 5001 (Backend): Available
    echo Port 5001 available >> "%CHECK_LOG%"
) else (
    echo ⚠ Port 5001 (Backend): In use
    echo WARNING: Port 5001 in use >> "%CHECK_LOG%"
)
echo.

REM Check 7: Running Processes
echo [7/12] Running Processes
echo =========================
echo [7/12] Running Processes >> "%CHECK_LOG%"

tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find "node.exe" >nul
if errorlevel 1 (
    echo ✓ No Node.js processes running
    echo No Node.js processes running >> "%CHECK_LOG%"
) else (
    echo ⚠ Node.js processes detected:
    echo Node.js processes detected >> "%CHECK_LOG%"
    tasklist /FI "IMAGENAME eq node.exe" /FO TABLE
    tasklist /FI "IMAGENAME eq node.exe" /FO CSV >> "%CHECK_LOG%"
)
echo.

REM Check 8: Disk Space
echo [8/12] Disk Space
echo ==================
echo [8/12] Disk Space >> "%CHECK_LOG%"

for /f "tokens=3" %%a in ('dir /-c "%APP_DIR%\.." ^| find "bytes free"') do set FREESPACE=%%a
echo Available disk space: %FREESPACE% bytes
echo Available disk space: %FREESPACE% bytes >> "%CHECK_LOG%"

REM Convert to MB for readability
set /a FREESPACE_MB=%FREESPACE%/1048576
echo Available disk space: %FREESPACE_MB% MB
echo Available disk space: %FREESPACE_MB% MB >> "%CHECK_LOG%"

if %FREESPACE_MB% gtr 1000 (
    echo ✓ Sufficient disk space available
    echo Sufficient disk space >> "%CHECK_LOG%"
) else (
    echo ⚠ Low disk space warning
    echo WARNING: Low disk space >> "%CHECK_LOG%"
)
echo.

REM Check 9: Firewall Rules
echo [9/12] Firewall Rules
echo ======================
echo [9/12] Firewall Rules >> "%CHECK_LOG%"

netsh advfirewall firewall show rule name="SmileSync Frontend" >nul 2>&1
if errorlevel 1 (
    echo ⚠ Frontend firewall rule: Not configured
    echo Frontend firewall rule not found >> "%CHECK_LOG%"
) else (
    echo ✓ Frontend firewall rule: Configured
    echo Frontend firewall rule configured >> "%CHECK_LOG%"
)

netsh advfirewall firewall show rule name="SmileSync Backend" >nul 2>&1
if errorlevel 1 (
    echo ⚠ Backend firewall rule: Not configured
    echo Backend firewall rule not found >> "%CHECK_LOG%"
) else (
    echo ✓ Backend firewall rule: Configured
    echo Backend firewall rule configured >> "%CHECK_LOG%"
)
echo.

REM Check 10: Scripts
echo [10/12] Scripts Availability
echo =============================
echo [10/12] Scripts Availability >> "%CHECK_LOG%"

if exist "%APP_DIR%\scripts\start-application.bat" (
    echo ✓ Start script: Available
    echo Start script available >> "%CHECK_LOG%"
) else (
    echo ❌ Start script: NOT FOUND
    echo ERROR: Start script not found >> "%CHECK_LOG%"
)

if exist "%APP_DIR%\scripts\stop-application.bat" (
    echo ✓ Stop script: Available
    echo Stop script available >> "%CHECK_LOG%"
) else (
    echo ❌ Stop script: NOT FOUND
    echo ERROR: Stop script not found >> "%CHECK_LOG%"
)

if exist "%APP_DIR%\scripts\backup-data.bat" (
    echo ✓ Backup script: Available
    echo Backup script available >> "%CHECK_LOG%"
) else (
    echo ❌ Backup script: NOT FOUND
    echo ERROR: Backup script not found >> "%CHECK_LOG%"
)
echo.

REM Check 11: Desktop Shortcut
echo [11/12] Desktop Shortcut
echo ========================
echo [11/12] Desktop Shortcut >> "%CHECK_LOG%"

if exist "%USERPROFILE%\Desktop\SmileSync.lnk" (
    echo ✓ Desktop shortcut: Available
    echo Desktop shortcut available >> "%CHECK_LOG%"
) else (
    echo ⚠ Desktop shortcut: NOT FOUND
    echo WARNING: Desktop shortcut not found >> "%CHECK_LOG%"
)
echo.

REM Check 12: Log Files
echo [12/12] Log Files
echo =================
echo [12/12] Log Files >> "%CHECK_LOG%"

if exist "%LOG_DIR%" (
    echo ✓ Log directory: %LOG_DIR%
    echo Log directory exists >> "%CHECK_LOG%"
    
    dir "%LOG_DIR%\*.log" >nul 2>&1
    if errorlevel 1 (
        echo   No log files found
        echo   No log files found >> "%CHECK_LOG%"
    ) else (
        echo   Log files:
        echo   Log files: >> "%CHECK_LOG%"
        for %%f in ("%LOG_DIR%\*.log") do (
            echo     %%~nxf
            echo     %%~nxf >> "%CHECK_LOG%"
        )
    )
) else (
    echo ❌ Log directory: NOT FOUND
    echo ERROR: Log directory not found >> "%CHECK_LOG%"
)
echo.

REM Summary
echo ========================================
echo System Check Summary
echo ========================================
echo System Check Summary >> "%CHECK_LOG%"
echo ======================================== >> "%CHECK_LOG%"

echo Check completed at %date% %time%
echo Check completed at %date% %time% >> "%CHECK_LOG%"
echo.
echo Log file saved to: %CHECK_LOG%
echo.

REM Quick health assessment
if "%NODE_OK%"=="0" (
    echo ❌ CRITICAL: Node.js is not installed
    echo CRITICAL: Node.js is not installed >> "%CHECK_LOG%"
    echo   SmileSync cannot run without Node.js
    echo.
) else (
    echo ✓ Node.js is properly installed
    echo Node.js is properly installed >> "%CHECK_LOG%"
)

if exist "%APP_DIR%\app" if exist "%APP_DIR%\backend" if exist "%DATA_DIR%\smilesync.db" (
    echo ✓ SmileSync appears to be properly installed
    echo SmileSync appears properly installed >> "%CHECK_LOG%"
) else (
    echo ❌ SmileSync installation appears incomplete
    echo WARNING: SmileSync installation incomplete >> "%CHECK_LOG%"
)

echo.
echo For detailed information, check the log file:
echo %CHECK_LOG%
echo.
echo Would you like to open the log file? (Y/N)
set /p "OPEN_LOG=Enter choice: "
if /i "!OPEN_LOG!" equ "Y" (
    start "" notepad "%CHECK_LOG%"
)

echo.
echo System check completed!
pause
exit /b 0