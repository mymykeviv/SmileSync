@echo off
setlocal enabledelayedexpansion

echo Stopping SmileSync development environment...

REM Function to safely kill processes by name
REM Kill nodemon processes
echo Stopping backend processes...
taskkill /f /im nodemon.exe >nul 2>&1
taskkill /f /im node.exe /fi "COMMANDLINE eq *nodemon*" >nul 2>&1
taskkill /f /im node.exe /fi "COMMANDLINE eq *backend*index.js*" >nul 2>&1

REM Kill React development server processes
echo Stopping frontend processes...
taskkill /f /im node.exe /fi "COMMANDLINE eq *react-scripts*" >nul 2>&1
taskkill /f /im node.exe /fi "COMMANDLINE eq *webpack*" >nul 2>&1

REM Kill Electron processes
echo Stopping Electron processes...
taskkill /f /im electron.exe >nul 2>&1

REM Kill any remaining SmileSync related processes
taskkill /f /im node.exe /fi "WINDOWTITLE eq SmileSync*" >nul 2>&1

REM Wait a moment for processes to terminate
timeout /t 2 /nobreak >nul

echo.
echo ===============================================
echo SmileSync development environment stopped
echo ===============================================
echo.
pause