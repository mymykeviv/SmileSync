@echo off
setlocal enabledelayedexpansion

echo Starting SmileSync development environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js 16+ to continue.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not installed. Please install npm to continue.
    pause
    exit /b 1
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
if not exist "%PROJECT_ROOT%\backend\data" mkdir "%PROJECT_ROOT%\backend\data"

REM Start backend server in background
echo Starting backend server...
cd /d "%PROJECT_ROOT%\backend"
start "SmileSync Backend" cmd /c "npx nodemon index.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend development server
echo Starting frontend development server...
cd /d "%PROJECT_ROOT%\app"
start "SmileSync Frontend" cmd /c "set PORT=3002 && npm start"

echo.
echo ==============================================
echo SmileSync Development Environment Started
echo ==============================================
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3002
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