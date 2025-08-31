@echo off
setlocal enabledelayedexpansion
echo Stopping SmileSync development environment...

REM Function to kill processes on specific port
:kill_port
set port=%~1
echo Checking port %port%...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":%port% " ^| find "LISTENING"') do (
    set pid=%%a
    if defined pid (
        echo Stopping process on port %port% (PID: !pid!)...
        taskkill /f /pid !pid! >nul 2>&1
    )
)
exit /b

REM Kill specific SmileSync processes
echo Stopping backend server...
taskkill /f /im nodemon.exe >nul 2>&1
taskkill /f /im node.exe /fi "WINDOWTITLE eq *nodemon*" >nul 2>&1

echo Stopping frontend development server...
taskkill /f /im node.exe /fi "WINDOWTITLE eq *react-scripts*" >nul 2>&1
taskkill /f /im node.exe /fi "WINDOWTITLE eq *webpack*" >nul 2>&1

echo Stopping Electron processes...
taskkill /f /im electron.exe >nul 2>&1

REM Kill processes on specific ports
echo Checking for processes on development ports...
call :kill_port 3000
call :kill_port 5001
call :kill_port 8080

REM Check for additional Node.js processes that might be SmileSync-related
echo Scanning for other SmileSync-related processes...
for /f "tokens=2,5" %%a in ('tasklist /fi "imagename eq node.exe" /fo csv /nh') do (
    set pid=%%b
    set pid=!pid:"=!
    if defined pid (
        REM Check if process is using ports in our range
        for /L %%p in (3001,1,3010) do (
            for /f "tokens=5" %%c in ('netstat -ano ^| find ":%%p " ^| find "LISTENING" ^| find "!pid!"') do (
                echo Found Node.js process on port %%p, stopping...
                taskkill /f /pid !pid! >nul 2>&1
            )
        )
    )
)

echo.
echo === SmileSync Development Environment Stopped ===
echo All development processes have been terminated.
echo ===================================================
echo.
pause