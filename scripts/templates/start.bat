@echo off
setlocal
set ROOT=%~dp0

echo SmileSync Startup Script
echo ========================
echo Root directory: %ROOT%
echo.

REM Create log directories
echo Creating log directories...
if not exist "%ROOT%logs" (
    mkdir "%ROOT%logs"
    if errorlevel 1 (
        echo ERROR: Failed to create logs directory
        goto :error
    )
)
if not exist "%ROOT%backend\logs" mkdir "%ROOT%backend\logs"
if not exist "%ROOT%nginx\logs" mkdir "%ROOT%nginx\logs"
if not exist "%ROOT%logs\backend.out.log" type nul > "%ROOT%logs\backend.out.log"
if not exist "%ROOT%logs\backend.err.log" type nul > "%ROOT%logs\backend.err.log"

REM Check if backend directory exists
if not exist "%ROOT%backend" (
    echo ERROR: Backend directory not found at %ROOT%backend
    goto :error
)

REM Check if Node.js is available
set PATH=%ROOT%runtime\node\;%PATH%
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please ensure Node.js runtime is available.
    goto :error
)

REM Start backend
echo Starting backend (node) on PORT 5001 with NODE_ENV="production"...
cd /d "%ROOT%backend"
if errorlevel 1 (
    echo ERROR: Failed to change to backend directory
    goto :error
)
set PORT=5001
set NODE_ENV="production"
start "SmileSync Backend" cmd /k "echo Starting Node.js in %CD% && node index.js"
echo Backend started in separate window.

REM Check if nginx directory exists
if not exist "%ROOT%nginx" (
    echo ERROR: Nginx directory not found at %ROOT%nginx
    goto :error
)

REM Start nginx
echo Starting nginx on http://localhost:8080 ...
cd /d "%ROOT%nginx"
if errorlevel 1 (
    echo ERROR: Failed to change to nginx directory
    goto :error
)
start "SmileSync Nginx" cmd /k "echo Starting nginx in %CD% && nginx.exe -p . -c conf\nginx.conf"
echo Nginx started in separate window.

REM Display information
echo.
echo ===== SmileSync Started Successfully =====
echo Frontend: http://localhost:8080
echo API:      http://localhost:5001
echo Logs folder: %ROOT%logs (backend.out.log, backend.err.log)
echo Nginx logs:  %ROOT%nginx\logs (access.log, error.log)
echo.
echo Both services are running in separate windows.
echo Close this window or press Ctrl+C to continue.
echo.

echo Press any key to exit...
pause
goto :end

:error
echo.
echo ===== STARTUP FAILED =====
echo Please check the error messages above.
echo Make sure all required files and directories exist.
echo.
echo Press any key to exit...
pause

:end