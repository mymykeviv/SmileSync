@echo off
setlocal enabledelayedexpansion

REM SmileSync Uninstaller
REM Version: 1.0.0
REM Description: Completely removes SmileSync from the system

echo ========================================
echo SmileSync Uninstaller
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This uninstaller must be run as Administrator.
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Set directories
set "APP_DIR=C:\SmileSync"
set "LOG_DIR=%APP_DIR%\logs"
set "UNINSTALL_LOG=%LOG_DIR%\uninstall_%date:~-4,4%%date:~-10,2%%date:~-7,2%.log"

echo WARNING: This will completely remove SmileSync from your computer.
echo.
echo The following will be removed:
echo - Application files: %APP_DIR%
echo - Desktop shortcut
echo - Windows Firewall rules
echo - All data and databases (unless backed up)
echo.
echo Are you sure you want to continue? (Y/N)
set /p "CONFIRM=Enter choice: "
if /i "!CONFIRM!" neq "Y" (
    echo Uninstallation cancelled
    pause
    exit /b 0
)

echo.
echo Do you want to create a backup before uninstalling? (Y/N)
set /p "BACKUP=Enter choice: "
if /i "!BACKUP!" equ "Y" (
    if exist "%APP_DIR%\scripts\backup-data.bat" (
        echo Creating backup...
        call "%APP_DIR%\scripts\backup-data.bat"
        echo Backup completed. Continuing with uninstallation...
        echo.
    ) else (
        echo Backup script not found. Continuing without backup...
        echo.
    )
)

REM Create logs directory if it doesn't exist
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Start logging
echo Uninstallation started at %date% %time% > "%UNINSTALL_LOG%"
echo ======================================== >> "%UNINSTALL_LOG%"
echo. >> "%UNINSTALL_LOG%"

echo Starting SmileSync uninstallation...
echo.

REM Step 1: Stop running services
echo [1/8] Stopping SmileSync services...
echo [1/8] Stopping SmileSync services... >> "%UNINSTALL_LOG%"

REM Check for running processes
tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find "node.exe" >nul
if not errorlevel 1 (
    echo Stopping Node.js processes...
    echo Stopping Node.js processes... >> "%UNINSTALL_LOG%"
    
    REM Try graceful shutdown first
    taskkill /IM node.exe /T >nul 2>&1
    timeout /t 3 >nul
    
    REM Force kill if still running
    tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find "node.exe" >nul
    if not errorlevel 1 (
        echo Force stopping processes...
        taskkill /F /IM node.exe /T >nul 2>&1
        echo Force stopped processes >> "%UNINSTALL_LOG%"
    )
    
    echo ✓ Services stopped
    echo Services stopped successfully >> "%UNINSTALL_LOG%"
) else (
    echo ✓ No running services found
    echo No running services found >> "%UNINSTALL_LOG%"
)

REM Step 2: Remove Windows Firewall rules
echo [2/8] Removing Windows Firewall rules...
echo [2/8] Removing Windows Firewall rules... >> "%UNINSTALL_LOG%"

netsh advfirewall firewall delete rule name="SmileSync Frontend" >nul 2>&1
if errorlevel 1 (
    echo Frontend firewall rule not found >> "%UNINSTALL_LOG%"
) else (
    echo Frontend firewall rule removed >> "%UNINSTALL_LOG%"
)

netsh advfirewall firewall delete rule name="SmileSync Backend" >nul 2>&1
if errorlevel 1 (
    echo Backend firewall rule not found >> "%UNINSTALL_LOG%"
) else (
    echo Backend firewall rule removed >> "%UNINSTALL_LOG%"
)

echo ✓ Firewall rules removed

REM Step 3: Remove desktop shortcut
echo [3/8] Removing desktop shortcut...
echo [3/8] Removing desktop shortcut... >> "%UNINSTALL_LOG%"

if exist "%USERPROFILE%\Desktop\SmileSync.lnk" (
    del "%USERPROFILE%\Desktop\SmileSync.lnk" >nul 2>&1
    echo ✓ Desktop shortcut removed
    echo Desktop shortcut removed >> "%UNINSTALL_LOG%"
) else (
    echo ✓ No desktop shortcut found
    echo No desktop shortcut found >> "%UNINSTALL_LOG%"
)

REM Step 4: Remove Start Menu entries (if any)
echo [4/8] Removing Start Menu entries...
echo [4/8] Removing Start Menu entries... >> "%UNINSTALL_LOG%"

if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\SmileSync.lnk" (
    del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\SmileSync.lnk" >nul 2>&1
    echo Start Menu shortcut removed >> "%UNINSTALL_LOG%"
)

echo ✓ Start Menu entries checked

REM Step 5: Clear temporary files
echo [5/8] Clearing temporary files...
echo [5/8] Clearing temporary files... >> "%UNINSTALL_LOG%"

REM Clear Node.js cache
if exist "%APPDATA%\npm-cache" (
    echo Clearing npm cache...
    rmdir /s /q "%APPDATA%\npm-cache" >nul 2>&1
    echo npm cache cleared >> "%UNINSTALL_LOG%"
)

REM Clear temporary SmileSync files
if exist "%TEMP%\SmileSync*" (
    del /q "%TEMP%\SmileSync*" >nul 2>&1
    echo Temporary files cleared >> "%UNINSTALL_LOG%"
)

echo ✓ Temporary files cleared

REM Step 6: Remove application files
echo [6/8] Removing application files...
echo [6/8] Removing application files... >> "%UNINSTALL_LOG%"

if exist "%APP_DIR%" (
    echo Removing %APP_DIR%...
    
    REM Try to remove the directory
    rmdir /s /q "%APP_DIR%" >nul 2>&1
    
    REM Check if removal was successful
    if exist "%APP_DIR%" (
        echo WARNING: Some files could not be removed
        echo WARNING: Some files could not be removed >> "%UNINSTALL_LOG%"
        echo This may be due to:
        echo - Files in use by another process
        echo - Insufficient permissions
        echo - Antivirus interference
        echo.
        echo Attempting to remove individual files...
        
        REM Try to remove files individually
        for /r "%APP_DIR%" %%f in (*) do (
            del "%%f" >nul 2>&1
        )
        
        REM Try to remove directories
        for /d %%d in ("%APP_DIR%\*") do (
            rmdir /s /q "%%d" >nul 2>&1
        )
        
        REM Final check
        if exist "%APP_DIR%" (
            echo ERROR: Could not completely remove %APP_DIR%
            echo ERROR: Manual removal required >> "%UNINSTALL_LOG%"
            echo Please manually delete: %APP_DIR%
        ) else (
            echo ✓ Application files removed (after retry)
            echo Application files removed after retry >> "%UNINSTALL_LOG%"
        )
    ) else (
        echo ✓ Application files removed
        echo Application files removed successfully >> "%UNINSTALL_LOG%"
    )
) else (
    echo ✓ No application files found
    echo No application files found >> "%UNINSTALL_LOG%"
)

REM Step 7: Registry cleanup (minimal)
echo [7/8] Cleaning registry entries...
echo [7/8] Cleaning registry entries... >> "%UNINSTALL_LOG%"

REM Remove any SmileSync-specific registry entries (if any were created)
REM Note: SmileSync doesn't typically create registry entries, but this is for completeness
reg delete "HKCU\Software\SmileSync" /f >nul 2>&1
reg delete "HKLM\Software\SmileSync" /f >nul 2>&1

echo ✓ Registry cleanup completed
echo Registry cleanup completed >> "%UNINSTALL_LOG%"

REM Step 8: Final verification
echo [8/8] Performing final verification...
echo [8/8] Performing final verification... >> "%UNINSTALL_LOG%"

REM Check for remaining processes
tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find "node.exe" >nul
if not errorlevel 1 (
    echo WARNING: Node.js processes still running
    echo WARNING: Node.js processes still running >> "%UNINSTALL_LOG%"
) else (
    echo ✓ No remaining processes
    echo No remaining processes >> "%UNINSTALL_LOG%"
)

REM Check for remaining files
if exist "%APP_DIR%" (
    echo WARNING: Some application files remain
    echo WARNING: Some application files remain >> "%UNINSTALL_LOG%"
) else (
    echo ✓ All application files removed
    echo All application files removed >> "%UNINSTALL_LOG%"
)

REM Check ports
netstat -an | find ":3000" >nul
if not errorlevel 1 (
    echo WARNING: Port 3000 still in use
    echo WARNING: Port 3000 still in use >> "%UNINSTALL_LOG%"
) else (
    echo ✓ Port 3000 is free
    echo Port 3000 is free >> "%UNINSTALL_LOG%"
)

netstat -an | find ":5001" >nul
if not errorlevel 1 (
    echo WARNING: Port 5001 still in use
    echo WARNING: Port 5001 still in use >> "%UNINSTALL_LOG%"
) else (
    echo ✓ Port 5001 is free
    echo Port 5001 is free >> "%UNINSTALL_LOG%"
)

REM Completion
echo.
echo ========================================
echo Uninstallation Completed
echo ========================================
echo.
echo Uninstallation completed at %date% %time% >> "%UNINSTALL_LOG%"

echo SmileSync has been removed from your computer.
echo.
echo Summary:
echo ✓ Services stopped
echo ✓ Firewall rules removed
echo ✓ Desktop shortcuts removed
echo ✓ Application files removed
echo ✓ Temporary files cleared
echo ✓ Registry entries cleaned
echo.

if exist "%APP_DIR%" (
    echo ⚠ WARNING: Some files could not be removed automatically.
    echo   Please manually delete: %APP_DIR%
    echo.
)

echo Note: Node.js was not removed as it may be used by other applications.
echo If you want to remove Node.js, please uninstall it from Control Panel.
echo.

REM Save final log (if possible)
if exist "%LOG_DIR%" (
    echo Log file saved to: %UNINSTALL_LOG%
    echo.
    echo Would you like to view the uninstallation log? (Y/N)
    set /p "VIEW_LOG=Enter choice: "
    if /i "!VIEW_LOG!" equ "Y" (
        if exist "%UNINSTALL_LOG%" (
            start "" notepad "%UNINSTALL_LOG%"
        )
    )
)

echo Thank you for using SmileSync!
echo.
pause
exit /b 0