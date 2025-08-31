@echo off
setlocal enabledelayedexpansion

echo Stopping SmileSync production application...

REM Kill Electron processes
echo Stopping Electron application...
taskkill /f /im electron.exe >nul 2>&1

REM Kill any Node.js processes related to SmileSync
taskkill /f /im node.exe /fi "COMMANDLINE eq *smilesync*" >nul 2>&1
taskkill /f /im node.exe /fi "COMMANDLINE eq *SmileSync*" >nul 2>&1

REM Wait a moment for processes to terminate
timeout /t 2 /nobreak >nul

echo.
echo ===============================================
echo SmileSync production application stopped
echo ===============================================
echo.
pause