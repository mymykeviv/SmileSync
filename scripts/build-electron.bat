@echo off
setlocal enabledelayedexpansion

echo Building SmileSync for distribution...

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

REM Clean previous builds
echo Cleaning previous builds...
if exist "%PROJECT_ROOT%\dist" rmdir /s /q "%PROJECT_ROOT%\dist"
if exist "%PROJECT_ROOT%\app\build" rmdir /s /q "%PROJECT_ROOT%\app\build"

REM Install dependencies if needed
echo Checking dependencies...
cd /d "%PROJECT_ROOT%"
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)

cd /d "%PROJECT_ROOT%\app"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

cd /d "%PROJECT_ROOT%\backend"
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
)

REM Build frontend
echo Building frontend for production...
cd /d "%PROJECT_ROOT%\app"
npm run build
if errorlevel 1 (
    echo Error: Frontend build failed.
    pause
    exit /b 1
)

REM Build Electron app
echo Building Electron application...
cd /d "%PROJECT_ROOT%"
npm run electron:dist
if errorlevel 1 (
    echo Error: Electron build failed.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo SmileSync build completed successfully!
echo ===============================================
echo Distribution files are in the 'dist' folder
echo ===============================================
echo.
pause