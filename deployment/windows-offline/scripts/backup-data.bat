@echo off
setlocal enabledelayedexpansion

REM SmileSync Data Backup Script
REM Version: 1.0.0
REM Description: Creates a backup of SmileSync database and configuration files

echo ========================================
echo SmileSync Data Backup Utility
echo ========================================
echo.

REM Set directories
set "APP_DIR=C:\SmileSync"
set "DATA_DIR=%APP_DIR%\data"
set "BACKUP_DIR=%APP_DIR%\backups"
set "LOG_DIR=%APP_DIR%\logs"

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Generate timestamp for backup folder
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YEAR=%dt:~0,4%"
set "MONTH=%dt:~4,2%"
set "DAY=%dt:~6,2%"
set "HOUR=%dt:~8,2%"
set "MINUTE=%dt:~10,2%"
set "SECOND=%dt:~12,2%"
set "TIMESTAMP=%YEAR%-%MONTH%-%DAY%_%HOUR%-%MINUTE%-%SECOND%"

set "BACKUP_FOLDER=%BACKUP_DIR%\backup_%TIMESTAMP%"
set "BACKUP_LOG=%LOG_DIR%\backup_%TIMESTAMP%.log"

echo Backup started at %date% %time%
echo Creating backup folder: %BACKUP_FOLDER%
echo.

REM Create timestamped backup folder
mkdir "%BACKUP_FOLDER%"

REM Start logging
echo Backup started at %date% %time% > "%BACKUP_LOG%"
echo Backup folder: %BACKUP_FOLDER% >> "%BACKUP_LOG%"
echo. >> "%BACKUP_LOG%"

REM Check if SmileSync is running
echo [1/5] Checking if SmileSync is running...
echo [1/5] Checking if SmileSync is running... >> "%BACKUP_LOG%"

tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find "node.exe" >nul
if not errorlevel 1 (
    echo WARNING: SmileSync appears to be running
    echo WARNING: SmileSync appears to be running >> "%BACKUP_LOG%"
    echo For best results, please stop SmileSync before backup
    echo.
    echo Do you want to continue anyway? (Y/N)
    set /p "CONTINUE=Enter choice: "
    if /i "!CONTINUE!" neq "Y" (
        echo Backup cancelled by user >> "%BACKUP_LOG%"
        echo Backup cancelled
        pause
        exit /b 0
    )
) else (
    echo SmileSync is not running - safe to backup >> "%BACKUP_LOG%"
    echo SmileSync is not running - safe to backup
)

REM Step 2: Backup database
echo [2/5] Backing up database...
echo [2/5] Backing up database... >> "%BACKUP_LOG%"

if exist "%DATA_DIR%\smilesync.db" (
    echo Copying database file...
    copy "%DATA_DIR%\smilesync.db" "%BACKUP_FOLDER%\smilesync.db" >nul
    if errorlevel 1 (
        echo ERROR: Failed to backup database >> "%BACKUP_LOG%"
        echo ERROR: Failed to backup database
        pause
        exit /b 1
    )
    echo Database backed up successfully >> "%BACKUP_LOG%"
    echo ✓ Database backed up successfully
) else (
    echo WARNING: Database file not found >> "%BACKUP_LOG%"
    echo WARNING: Database file not found at %DATA_DIR%\smilesync.db
)

REM Step 3: Backup configuration files
echo [3/5] Backing up configuration files...
echo [3/5] Backing up configuration files... >> "%BACKUP_LOG%"

REM Create config backup folder
mkdir "%BACKUP_FOLDER%\config"

REM Backup package.json files
if exist "%APP_DIR%\package.json" (
    copy "%APP_DIR%\package.json" "%BACKUP_FOLDER%\config\root-package.json" >nul
    echo Root package.json backed up >> "%BACKUP_LOG%"
)

if exist "%APP_DIR%\app\package.json" (
    copy "%APP_DIR%\app\package.json" "%BACKUP_FOLDER%\config\app-package.json" >nul
    echo App package.json backed up >> "%BACKUP_LOG%"
)

if exist "%APP_DIR%\backend\package.json" (
    copy "%APP_DIR%\backend\package.json" "%BACKUP_FOLDER%\config\backend-package.json" >nul
    echo Backend package.json backed up >> "%BACKUP_LOG%"
)

REM Backup environment files if they exist
if exist "%APP_DIR%\.env" (
    copy "%APP_DIR%\.env" "%BACKUP_FOLDER%\config\.env" >nul
    echo Root .env backed up >> "%BACKUP_LOG%"
)

if exist "%APP_DIR%\app\.env" (
    copy "%APP_DIR%\app\.env" "%BACKUP_FOLDER%\config\app-.env" >nul
    echo App .env backed up >> "%BACKUP_LOG%"
)

if exist "%APP_DIR%\backend\.env" (
    copy "%APP_DIR%\backend\.env" "%BACKUP_FOLDER%\config\backend-.env" >nul
    echo Backend .env backed up >> "%BACKUP_LOG%"
)

echo ✓ Configuration files backed up

REM Step 4: Backup logs
echo [4/5] Backing up recent logs...
echo [4/5] Backing up recent logs... >> "%BACKUP_LOG%"

mkdir "%BACKUP_FOLDER%\logs"

if exist "%LOG_DIR%\*.log" (
    xcopy "%LOG_DIR%\*.log" "%BACKUP_FOLDER%\logs\" /Y >nul 2>&1
    echo Recent logs backed up >> "%BACKUP_LOG%"
    echo ✓ Recent logs backed up
) else (
    echo No log files found >> "%BACKUP_LOG%"
    echo No log files found
)

REM Step 5: Create backup info file
echo [5/5] Creating backup information file...
echo [5/5] Creating backup information file... >> "%BACKUP_LOG%"

echo SmileSync Backup Information > "%BACKUP_FOLDER%\backup-info.txt"
echo ================================ >> "%BACKUP_FOLDER%\backup-info.txt"
echo. >> "%BACKUP_FOLDER%\backup-info.txt"
echo Backup Date: %date% >> "%BACKUP_FOLDER%\backup-info.txt"
echo Backup Time: %time% >> "%BACKUP_FOLDER%\backup-info.txt"
echo Backup Location: %BACKUP_FOLDER% >> "%BACKUP_FOLDER%\backup-info.txt"
echo. >> "%BACKUP_FOLDER%\backup-info.txt"
echo Contents: >> "%BACKUP_FOLDER%\backup-info.txt"
echo - Database: smilesync.db >> "%BACKUP_FOLDER%\backup-info.txt"
echo - Configuration files in config\ folder >> "%BACKUP_FOLDER%\backup-info.txt"
echo - Log files in logs\ folder >> "%BACKUP_FOLDER%\backup-info.txt"
echo. >> "%BACKUP_FOLDER%\backup-info.txt"
echo To restore this backup: >> "%BACKUP_FOLDER%\backup-info.txt"
echo 1. Stop SmileSync application >> "%BACKUP_FOLDER%\backup-info.txt"
echo 2. Copy smilesync.db to C:\SmileSync\data\ >> "%BACKUP_FOLDER%\backup-info.txt"
echo 3. Restore configuration files if needed >> "%BACKUP_FOLDER%\backup-info.txt"
echo 4. Restart SmileSync application >> "%BACKUP_FOLDER%\backup-info.txt"

echo ✓ Backup information file created

REM Calculate backup size
echo Calculating backup size...
for /f "usebackq" %%A in (`dir "%BACKUP_FOLDER%" /s /-c ^| find "bytes"`) do set "BACKUP_SIZE=%%A"

REM Complete backup
echo.
echo ========================================
echo Backup Completed Successfully!
echo ========================================
echo.
echo Backup Details:
echo - Location: %BACKUP_FOLDER%
echo - Size: %BACKUP_SIZE%
echo - Log file: %BACKUP_LOG%
echo.
echo Backup completed at %date% %time% >> "%BACKUP_LOG%"
echo Backup size: %BACKUP_SIZE% >> "%BACKUP_LOG%"

REM Clean up old backups (keep last 10)
echo Cleaning up old backups (keeping last 10)...
echo Cleaning up old backups... >> "%BACKUP_LOG%"

for /f "skip=10 delims=" %%i in ('dir "%BACKUP_DIR%\backup_*" /b /ad /o-d 2^>nul') do (
    echo Removing old backup: %%i
    rmdir /s /q "%BACKUP_DIR%\%%i" 2>nul
    echo Removed old backup: %%i >> "%BACKUP_LOG%"
)

echo.
echo The backup is stored in: %BACKUP_FOLDER%
echo.
echo Would you like to open the backup folder? (Y/N)
set /p "OPEN_FOLDER=Enter choice: "
if /i "!OPEN_FOLDER!" equ "Y" (
    start "" "%BACKUP_FOLDER%"
)

echo.
echo Backup process completed!
pause
exit /b 0