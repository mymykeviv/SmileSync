@echo off
REM Force execution in cmd.exe to avoid PowerShell execution policy issues
if "%COMSPEC%" neq "%SystemRoot%\system32\cmd.exe" (
    "%SystemRoot%\system32\cmd.exe" /c "%~f0" %*
    exit /b %errorlevel%
)
setlocal enabledelayedexpansion

REM SmileSync Offline Package Creator
REM Version: 1.0.0
REM Description: Creates a complete offline deployment package for Windows

echo ========================================
echo SmileSync Offline Package Creator
echo ========================================
echo.

REM Set directories
set "PROJECT_ROOT=%~dp0..\.."
set "PACKAGE_DIR=%~dp0"
set "OUTPUT_DIR=%PACKAGE_DIR%\..\SmileSync-Windows-Offline"
set "TEMP_DIR=%PACKAGE_DIR%\temp"

echo Project Root: %PROJECT_ROOT%
echo Package Directory: %PACKAGE_DIR%
echo Output Directory: %OUTPUT_DIR%
echo.

REM Check if we're in the right location
if not exist "%PROJECT_ROOT%\package.json" (
    echo ERROR: Cannot find SmileSync project root
    echo Please run this script from the deployment/windows-offline directory
    exit /b 1
)

REM Check prerequisites
echo [1/10] Checking prerequisites...

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is required to create the package
    exit /b 1
)
echo ✓ Node.js found

echo Checking npm...
for /f "delims=" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
if "%NPM_VERSION%"=="" (
    echo ERROR: npm is required to create the package
    exit /b 1
)
echo ✓ npm found (version %NPM_VERSION%)

echo Checking tar...
tar --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: tar not found - package creation will continue without compression
    set USE_TAR=false
) else (
    echo ✓ tar found
    set USE_TAR=true
)

echo ✓ Prerequisites check passed
echo.

REM Clean up previous package
echo [2/10] Cleaning up previous package...
if exist "%OUTPUT_DIR%" (
    echo Removing previous package...
    rmdir /s /q "%OUTPUT_DIR%"
)

if exist "%TEMP_DIR%" (
    echo Removing temporary files...
    rmdir /s /q "%TEMP_DIR%"
)

REM Create package structure
echo [3/10] Creating package structure...
mkdir "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%\setup"
mkdir "%OUTPUT_DIR%\application"
mkdir "%OUTPUT_DIR%\dependencies"
mkdir "%OUTPUT_DIR%\database"
mkdir "%OUTPUT_DIR%\scripts"
mkdir "%TEMP_DIR%"

echo ✓ Package structure created
echo.

REM Step 4: Download Node.js installer
echo [4/10] Preparing Node.js installer...
echo.
echo NOTE: Node.js installer download (optional):
echo 1. Go to https://nodejs.org/en/download/
echo 2. Download "Windows Installer (.msi)" for x64
echo 3. Save as: %OUTPUT_DIR%\setup\node-v18.19.0-x64.msi
echo.
echo Skipping Node.js installer download (can be added manually later)...
echo.

if not exist "%OUTPUT_DIR%\setup\node-v18.19.0-x64.msi" (
    echo WARNING: Node.js installer not found
    echo The package will be created without the Node.js installer
    echo Users will need to install Node.js manually
    echo.
)

REM Step 5: Create source code archive
echo [5/10] Creating source code archive...
cd /d "%PROJECT_ROOT%"

REM Create a clean copy of source code
echo Copying source code...
xcopy "%PROJECT_ROOT%\*" "%TEMP_DIR%\SmileSync\" /E /I /H /Y /EXCLUDE:"%PACKAGE_DIR%exclude.txt"

REM Create exclusion list if it doesn't exist
if not exist "%PACKAGE_DIR%exclude.txt" (
    echo node_modules\ > "%PACKAGE_DIR%exclude.txt"
    echo .git\ >> "%PACKAGE_DIR%exclude.txt"
    echo .env >> "%PACKAGE_DIR%exclude.txt"
    echo *.log >> "%PACKAGE_DIR%exclude.txt"
    echo dist\ >> "%PACKAGE_DIR%exclude.txt"
    echo build\ >> "%PACKAGE_DIR%exclude.txt"
    echo coverage\ >> "%PACKAGE_DIR%exclude.txt"
    echo .nyc_output\ >> "%PACKAGE_DIR%exclude.txt"
)

REM Remove node_modules and other unnecessary files from temp copy
if exist "%TEMP_DIR%\SmileSync\node_modules" rmdir /s /q "%TEMP_DIR%\SmileSync\node_modules"
if exist "%TEMP_DIR%\SmileSync\app\node_modules" rmdir /s /q "%TEMP_DIR%\SmileSync\app\node_modules"
if exist "%TEMP_DIR%\SmileSync\backend\node_modules" rmdir /s /q "%TEMP_DIR%\SmileSync\backend\node_modules"
if exist "%TEMP_DIR%\SmileSync\.git" rmdir /s /q "%TEMP_DIR%\SmileSync\.git"

REM Create source archive
echo Creating source archive...
cd /d "%TEMP_DIR%"
tar -czf "%OUTPUT_DIR%\application\SmileSync-source.zip" SmileSync

echo ✓ Source code archive created
echo.

REM Step 6: Install and package dependencies
echo [6/10] Installing and packaging dependencies...
cd /d "%PROJECT_ROOT%"

echo Installing root dependencies...
npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install root dependencies
    exit /b 1
)

echo Running electron-builder install-app-deps...
electron-builder install-app-deps
if errorlevel 1 (
    echo WARNING: electron-builder install-app-deps failed, continuing...
)

echo Packaging root dependencies...
tar -czf "%OUTPUT_DIR%\dependencies\node_modules.tar.gz" node_modules

echo Installing frontend dependencies...
cd /d "%PROJECT_ROOT%\app"
npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    exit /b 1
)

echo Packaging frontend dependencies...
tar -czf "%OUTPUT_DIR%\dependencies\app-dependencies.tar.gz" node_modules

echo Installing backend dependencies...
cd /d "%PROJECT_ROOT%\backend"
npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    exit /b 1
)

echo Packaging backend dependencies...
tar -czf "%OUTPUT_DIR%\dependencies\backend-dependencies.tar.gz" node_modules

echo ✓ Dependencies packaged
echo.

REM Step 7: Create template database
echo [7/10] Creating template database...
cd /d "%PROJECT_ROOT%\backend"

REM Initialize database with default users
echo Creating database with default users...
node scripts\create-admin.js
if errorlevel 1 (
    echo ERROR: Failed to create template database
    exit /b 1
)

REM Copy database to package
if exist "data\smilesync.db" (
    copy "data\smilesync.db" "%OUTPUT_DIR%\database\smilesync-template.db"
    echo ✓ Template database created
) else (
    echo WARNING: Database file not found
)
echo.

REM Step 8: Copy scripts
echo [8/10] Copying deployment scripts...

REM Copy scripts from scripts folder
if exist "%PACKAGE_DIR%\scripts\" (
    echo Copying scripts from scripts folder...
    xcopy "%PACKAGE_DIR%\scripts\*" "%OUTPUT_DIR%\scripts\" /Y /I
    if errorlevel 1 (
        echo WARNING: Failed to copy some scripts
    ) else (
        echo ✓ Scripts copied successfully
    )
) else (
    echo WARNING: Scripts folder not found at %PACKAGE_DIR%\scripts\
)

REM Copy install.bat
if exist "%PACKAGE_DIR%\install.bat" (
    echo Copying install.bat...
    copy "%PACKAGE_DIR%\install.bat" "%OUTPUT_DIR%\install.bat"
    if errorlevel 1 (
        echo WARNING: Failed to copy install.bat
    ) else (
        echo ✓ install.bat copied successfully
    )
) else (
    echo WARNING: install.bat not found at %PACKAGE_DIR%\install.bat
)

REM Copy README.md
if exist "%PACKAGE_DIR%\README.md" (
    echo Copying README.md...
    copy "%PACKAGE_DIR%\README.md" "%OUTPUT_DIR%\README.md"
    if errorlevel 1 (
        echo WARNING: Failed to copy README.md
    ) else (
        echo ✓ README.md copied successfully
    )
) else (
    echo WARNING: README.md not found at %PACKAGE_DIR%\README.md
)

echo ✓ Script copying completed
echo.

REM Step 9: Create package information
echo [9/10] Creating package information...

echo SmileSync Windows Offline Deployment Package > "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo ============================================== >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo. >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo Package Created: %date% %time% >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo Created By: %USERNAME% >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo Computer: %COMPUTERNAME% >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo. >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo Package Contents: >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo - setup/: Node.js installer >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo - application/: SmileSync source code >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo - dependencies/: Pre-installed npm packages >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo - database/: Template database with default users >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo - scripts/: Management and utility scripts >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo - install.bat: Main installation script >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo - README.md: Detailed installation instructions >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo. >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo Installation Instructions: >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo 1. Copy this entire folder to the target Windows computer >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo 2. Right-click install.bat and select "Run as administrator" >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo 3. Follow the installation prompts >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo 4. Use the desktop shortcut to start SmileSync >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo. >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo Default Login Credentials: >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo - Admin: admin / admin123 >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo - Dentist: drsmith / dentist123 >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"
echo - Staff: staff / staff123 >> "%OUTPUT_DIR%\PACKAGE-INFO.txt"

echo ✓ Package information created
echo.

REM Step 10: Calculate package size and finalize
echo [10/10] Finalizing package...

REM Clean up temporary files
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"

REM Calculate total package size
for /f "usebackq" %%A in (`dir "%OUTPUT_DIR%" /s /-c ^| find "bytes"`) do set "PACKAGE_SIZE=%%A"
set /a PACKAGE_SIZE_MB=%PACKAGE_SIZE%/1048576

echo ✓ Package finalized
echo.

REM Package creation completed
echo ========================================
echo Package Creation Completed!
echo ========================================
echo.
echo Package Location: %OUTPUT_DIR%
echo Package Size: %PACKAGE_SIZE_MB% MB
echo.
echo The offline deployment package is ready!
echo.
echo To deploy SmileSync:
echo 1. Copy the entire "%OUTPUT_DIR%" folder to a USB drive
echo 2. Transfer to the target Windows computer
echo 3. Run install.bat as administrator
echo.
echo Package Contents:
dir "%OUTPUT_DIR%" /B
echo.
echo Would you like to open the package folder? (Y/N)
set /p "OPEN_PACKAGE=Enter choice: "
if /i "!OPEN_PACKAGE!" equ "Y" (
    start "" "%OUTPUT_DIR%"
)

echo.
echo Package creation completed successfully!
exit /b 0