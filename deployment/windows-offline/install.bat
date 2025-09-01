@echo off
setlocal enabledelayedexpansion

REM SmileSync Offline Windows Installer
REM Version: 1.0.0
REM Description: Installs SmileSync dental practice management system offline

echo ========================================
echo SmileSync Offline Windows Installer
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer must be run as Administrator.
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Set installation directory
set "INSTALL_DIR=C:\SmileSync"
set "CURRENT_DIR=%~dp0"
set "LOG_FILE=%INSTALL_DIR%\installation.log"

echo Installation Directory: %INSTALL_DIR%
echo Current Directory: %CURRENT_DIR%
echo.

REM Create installation directory
if not exist "%INSTALL_DIR%" (
    echo Creating installation directory...
    mkdir "%INSTALL_DIR%"
    mkdir "%INSTALL_DIR%\logs"
    mkdir "%INSTALL_DIR%\backups"
    mkdir "%INSTALL_DIR%\data"
)

REM Start logging
echo Installation started at %date% %time% > "%LOG_FILE%"

REM Step 1: Check system requirements
echo [1/8] Checking system requirements...
echo [1/8] Checking system requirements... >> "%LOG_FILE%"

REM Check Windows version
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo Windows Version: %VERSION% >> "%LOG_FILE%"

REM Check available disk space (simplified check)
for /f "tokens=3" %%a in ('dir /-c "%INSTALL_DIR%\.." ^| find "bytes free"') do set FREESPACE=%%a
echo Free disk space: %FREESPACE% bytes >> "%LOG_FILE%"

REM Step 2: Install Node.js
echo [2/8] Installing Node.js...
echo [2/8] Installing Node.js... >> "%LOG_FILE%"

node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js not found. Installing from package...
    if exist "%CURRENT_DIR%setup\node-v18.19.0-x64.msi" (
        echo Installing Node.js v18.19.0...
        msiexec /i "%CURRENT_DIR%setup\node-v18.19.0-x64.msi" /quiet /norestart
        if errorlevel 1 (
            echo ERROR: Node.js installation failed >> "%LOG_FILE%"
            echo ERROR: Node.js installation failed
            pause
            exit /b 1
        )
        echo Node.js installed successfully >> "%LOG_FILE%"
    ) else (
        echo ERROR: Node.js installer not found in setup folder >> "%LOG_FILE%"
        echo ERROR: Node.js installer not found
        pause
        exit /b 1
    )
) else (
    echo Node.js already installed >> "%LOG_FILE%"
    echo Node.js already installed
)

REM Refresh environment variables
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Step 3: Extract application files
echo [3/8] Extracting application files...
echo [3/8] Extracting application files... >> "%LOG_FILE%"

if exist "%CURRENT_DIR%application\SmileSync-source.zip" (
    echo Extracting source code...
    powershell -command "Expand-Archive -Path '%CURRENT_DIR%application\SmileSync-source.zip' -DestinationPath '%INSTALL_DIR%' -Force"
    if errorlevel 1 (
        echo ERROR: Failed to extract application files >> "%LOG_FILE%"
        echo ERROR: Failed to extract application files
        pause
        exit /b 1
    )
    echo Application files extracted successfully >> "%LOG_FILE%"
) else (
    echo ERROR: Application source files not found >> "%LOG_FILE%"
    echo ERROR: Application source files not found
    pause
    exit /b 1
)

REM Step 4: Install dependencies from cache
echo [4/8] Installing dependencies from cache...
echo [4/8] Installing dependencies from cache... >> "%LOG_FILE%"

REM Extract root dependencies
if exist "%CURRENT_DIR%dependencies\node_modules.tar.gz" (
    echo Extracting root dependencies...
    cd /d "%INSTALL_DIR%"
    tar -xzf "%CURRENT_DIR%dependencies\node_modules.tar.gz"
    echo Root dependencies installed >> "%LOG_FILE%"
)

REM Extract frontend dependencies
if exist "%CURRENT_DIR%dependencies\app-dependencies.tar.gz" (
    echo Extracting frontend dependencies...
    cd /d "%INSTALL_DIR%\app"
    tar -xzf "%CURRENT_DIR%dependencies\app-dependencies.tar.gz"
    echo Frontend dependencies installed >> "%LOG_FILE%"
)

REM Extract backend dependencies
if exist "%CURRENT_DIR%dependencies\backend-dependencies.tar.gz" (
    echo Extracting backend dependencies...
    cd /d "%INSTALL_DIR%\backend"
    tar -xzf "%CURRENT_DIR%dependencies\backend-dependencies.tar.gz"
    echo Backend dependencies installed >> "%LOG_FILE%"
)

REM Step 5: Set up database
echo [5/8] Setting up database...
echo [5/8] Setting up database... >> "%LOG_FILE%"

if exist "%CURRENT_DIR%database\smilesync-template.db" (
    echo Copying pre-configured database...
    copy "%CURRENT_DIR%database\smilesync-template.db" "%INSTALL_DIR%\data\smilesync.db"
    echo Database setup completed >> "%LOG_FILE%"
) else (
    echo Creating new database...
    cd /d "%INSTALL_DIR%\backend"
    node scripts\create-admin.js
    echo New database created >> "%LOG_FILE%"
)

REM Step 6: Create startup scripts
echo [6/8] Creating startup scripts...
echo [6/8] Creating startup scripts... >> "%LOG_FILE%"

REM Copy scripts from deployment package
if exist "%CURRENT_DIR%scripts" (
    xcopy "%CURRENT_DIR%scripts\*" "%INSTALL_DIR%\scripts\" /Y /I
    echo Startup scripts copied >> "%LOG_FILE%"
)

REM Step 7: Create desktop shortcuts
echo [7/8] Creating desktop shortcuts...
echo [7/8] Creating desktop shortcuts... >> "%LOG_FILE%"

REM Create desktop shortcut using PowerShell
powershell -command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\SmileSync.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\scripts\start-application.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\app\public\favicon.ico'; $Shortcut.Description = 'SmileSync Dental Practice Management'; $Shortcut.Save()"

echo Desktop shortcut created >> "%LOG_FILE%"

REM Step 8: Configure Windows Firewall (optional)
echo [8/8] Configuring Windows Firewall...
echo [8/8] Configuring Windows Firewall... >> "%LOG_FILE%"

REM Add firewall rules for local access
netsh advfirewall firewall add rule name="SmileSync Frontend" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
netsh advfirewall firewall add rule name="SmileSync Backend" dir=in action=allow protocol=TCP localport=5001 >nul 2>&1

echo Firewall rules added >> "%LOG_FILE%"

REM Installation completed
echo.
echo ========================================
echo Installation Completed Successfully!
echo ========================================
echo.
echo SmileSync has been installed to: %INSTALL_DIR%
echo.
echo To start the application:
echo 1. Double-click the "SmileSync" shortcut on your desktop
echo 2. Or run: %INSTALL_DIR%\scripts\start-application.bat
echo.
echo Default login credentials:
echo - Admin: admin / admin123
echo - Dentist: drsmith / dentist123
echo - Staff: staff / staff123
echo.
echo Application will be available at: http://localhost:3000
echo.
echo Installation completed at %date% %time% >> "%LOG_FILE%"

echo Press any key to start SmileSync now...
pause >nul

REM Start the application
cd /d "%INSTALL_DIR%"
start "" "%INSTALL_DIR%\scripts\start-application.bat"

echo SmileSync is starting... Please wait for the browser to open.
echo If the browser doesn't open automatically, go to: http://localhost:3000

pause
exit /b 0