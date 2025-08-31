@echo off
setlocal enabledelayedexpansion
echo Starting SmileSync development environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js 16+ to continue.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install npm to continue.
    pause
    exit /b 1
)

REM Function to check if port is in use
:check_port
netstat -an | find ":%~1 " | find "LISTENING" >nul 2>&1
exit /b %errorlevel%

REM Function to find available port
:find_available_port
set /a port=%~1
:port_loop
call :check_port !port!
if %errorlevel% equ 0 (
    set /a port=!port!+1
    if !port! gtr %~1+100 (
        echo Error: Could not find available port after checking 100 ports starting from %~1
        exit /b 1
    )
    goto port_loop
)
set available_port=!port!
exit /b 0

REM Check for existing SmileSync processes
tasklist | find "node.exe" | find "SmileSync" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  SmileSync appears to be already running!
    echo    You can access the existing application at:
    call :check_port 3000
    if %errorlevel% equ 0 echo    Frontend: http://localhost:3000
    call :check_port 5001
    if %errorlevel% equ 0 echo    Backend API: http://localhost:5001
    echo.
    set /p "choice=Do you want to stop existing processes and start fresh? (y/N): "
    if /i "!choice!"=="y" (
        echo Stopping existing SmileSync processes...
        taskkill /f /im node.exe /fi "WINDOWTITLE eq *nodemon*" >nul 2>&1
        taskkill /f /im node.exe /fi "WINDOWTITLE eq *react-scripts*" >nul 2>&1
        timeout /t 2 >nul
    ) else (
        echo Exiting. Use existing running application.
        pause
        exit /b 0
    )
)

REM Get the project root directory
set "PROJECT_ROOT=%~dp0.."
echo Project root: %PROJECT_ROOT%

REM Install dependencies if node_modules doesn't exist
if not exist "%PROJECT_ROOT%\node_modules" (
    echo Installing root dependencies...
    cd /d "%PROJECT_ROOT%"
    npm install
)

if not exist "%PROJECT_ROOT%\app\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%PROJECT_ROOT%\app"
    npm install
)

if not exist "%PROJECT_ROOT%\backend\node_modules" (
    echo Installing backend dependencies...
    cd /d "%PROJECT_ROOT%\backend"
    npm install
)

REM Create data directory for SQLite database
if not exist "%PROJECT_ROOT%\data" mkdir "%PROJECT_ROOT%\data"

REM Determine backend port
set BACKEND_PORT=5001
call :check_port %BACKEND_PORT%
if %errorlevel% equ 0 (
    echo ⚠️  Port %BACKEND_PORT% is already in use.
    call :find_available_port %BACKEND_PORT%
    set BACKEND_PORT=!available_port!
    echo ✅ Using alternative backend port: !BACKEND_PORT!
)

REM Start backend server in background
echo Starting backend server on port !BACKEND_PORT!...
cd /d "%PROJECT_ROOT%\backend"
start "SmileSync Backend" cmd /c "set PORT=!BACKEND_PORT! && npx nodemon index.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Determine frontend port
set FRONTEND_PORT=3000
call :check_port %FRONTEND_PORT%
if %errorlevel% equ 0 (
    echo ⚠️  Port %FRONTEND_PORT% is already in use.
    call :find_available_port %FRONTEND_PORT%
    set FRONTEND_PORT=!available_port!
    echo ✅ Using alternative frontend port: !FRONTEND_PORT!
)

REM Start frontend development server
echo Starting frontend development server on port !FRONTEND_PORT!...
cd /d "%PROJECT_ROOT%\app"
start "SmileSync Frontend" cmd /c "set PORT=!FRONTEND_PORT! && npm start"

echo.
echo ==============================================
echo SmileSync Development Environment Started
echo ==============================================
echo Backend: http://localhost:!BACKEND_PORT!
echo Frontend: http://localhost:!FRONTEND_PORT!
echo ==============================================
echo.
echo Press any key to stop all services...
pause >nul

REM Stop services when user presses a key
echo Stopping services...
taskkill /f /im node.exe /fi "WINDOWTITLE eq SmileSync Backend" >nul 2>&1
taskkill /f /im node.exe /fi "WINDOWTITLE eq SmileSync Frontend" >nul 2>&1

echo Services stopped.
pause