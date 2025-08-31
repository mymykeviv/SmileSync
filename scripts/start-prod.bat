@echo off
setlocal enabledelayedexpansion

echo Starting SmileSync production application...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js 16+ to continue.
    pause
    exit /b 1
)

REM Get the project root directory
set "PROJECT_ROOT=%~dp0.."
echo Project root: %PROJECT_ROOT%

REM Check if production build exists
if not exist "%PROJECT_ROOT%\app\build" (
    echo Production build not found. Building frontend...
    cd /d "%PROJECT_ROOT%\app"
    npm run build
    if errorlevel 1 (
        echo Error: Frontend build failed.
        pause
        exit /b 1
    )
)

REM Check if dependencies are installed
if not exist "%PROJECT_ROOT%\node_modules" (
    echo Installing production dependencies...
    cd /d "%PROJECT_ROOT%"
    npm install --production
)

REM Create data directory for SQLite database
if not exist "%PROJECT_ROOT%\backend\data" mkdir "%PROJECT_ROOT%\backend\data"

REM Set production environment
set NODE_ENV=production

echo.
echo === Starting SmileSync Production Application ===
echo Environment: Production
echo Database: SQLite (local)
echo ===============================================
echo.

REM Start Electron app
cd /d "%PROJECT_ROOT%"
npm run electron:prod

echo.
echo SmileSync application has been closed.
pause