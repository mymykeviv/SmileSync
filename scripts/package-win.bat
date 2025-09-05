@echo off
setlocal EnableExtensions EnableDelayedExpansion

:: SmileSync - Windows Offline Production Packager
:: Produces a self-contained ZIP with nginx, backend (prod or exe), frontend build, and start/stop scripts

set PROJECT_ROOT=%~dp0..
pushd %PROJECT_ROOT%

where node >nul 2>&1 || (echo [ERROR] Node.js is required on the build machine. && exit /b 1)
where powershell >nul 2>&1 || (echo [ERROR] PowerShell is required on Windows. && exit /b 1)

for /f %%v in ('node -p "require('./package.json').version"') do set VERSION=%%v
if not defined VERSION set VERSION=0.0.0

set OUTDIR=deployment\SmileSync-%VERSION%-win64
set OUTZIP=deployment\SmileSync-%VERSION%-win64.zip

:: Clean previous
if exist "%OUTDIR%" rmdir /s /q "%OUTDIR%"
if exist "%OUTZIP%" del /q "%OUTZIP%"

mkdir "%OUTDIR%\nginx\conf"
mkdir "%OUTDIR%\backend"
mkdir "%OUTDIR%\frontend"
mkdir "%OUTDIR%\runtime\node"
mkdir "%OUTDIR%\scripts"

:: Build frontend
echo [1/8] Building frontend...
pushd app
if exist package-lock.json (
  call npm ci || (echo [WARN] npm ci failed, falling back to npm install... & call npm install)
) else (
  call npm install
)
call npm run build || (popd & echo [ERROR] Frontend build failed & exit /b 1)
popd

xcopy /e /i /y app\build "%OUTDIR%\frontend" >nul

:: Build backend executable (pkg) and prepare fallback
set BUILD_EXE=true
if exist backend\package.json (
  echo [2/8] Installing backend dev deps for packaging...
  pushd backend
  if exist package-lock.json (
    call npm ci || (echo [WARN] npm ci failed, falling back to npm install... & call npm install)
  ) else (
    call npm install
  )
  echo [3/8] Building backend executable with pkg...
  call npm run build:exe || (echo [WARN] Backend exe build failed. Will package Node runtime + JS backend. & set BUILD_EXE=false)
  popd
) else (
  set BUILD_EXE=false
)

:: Force Node runtime packaging due to sqlite3/pkg runtime issues
set BUILD_EXE=false

:: Prepare backend in output
echo [4/8] Preparing backend output...
:: Prepare backend in output
if /i "%BUILD_EXE%"=="true" (
  mkdir "%OUTDIR%\backend\bin" >nul 2>&1
  xcopy /e /i /y backend\dist "%OUTDIR%\backend\bin" >nul
  :: Copy sqlite3 native binding alongside exe (pkg cannot embed it)
  set "SQLITE_DST=%OUTDIR%\backend\bin\node_sqlite3.node"
  for /d %%B in (backend\node_modules\sqlite3\lib\binding\*\) do (
    for %%F in ("%%~fB\node_sqlite3.node") do (
      if exist "%%~fF" copy /y "%%~fF" "!SQLITE_DST!" >nul
    )
  )
  if not exist "!SQLITE_DST!" (
    if exist "backend\node_modules\sqlite3\build\Release\node_sqlite3.node" (
      copy /y "backend\node_modules\sqlite3\build\Release\node_sqlite3.node" "!SQLITE_DST!" >nul
    )
  )
  if not exist "!SQLITE_DST!" (
    echo [WARN] sqlite3 native binding not found. The backend exe may fail to start. Ensure sqlite3 built successfully.
  )
) else (
  xcopy /e /i /y backend "%OUTDIR%\backend" >nul
  pushd "%OUTDIR%\backend"
  rmdir /s /q node_modules 2>nul
  if exist package-lock.json (
    call npm ci --omit=dev || (echo [WARN] npm ci --omit=dev failed, falling back to npm install --omit=dev... & call npm install --omit=dev)
  ) else (
    call npm install --omit=dev
  )
  popd
)

:: Download Node.js runtime only if not using exe
 echo [5/8] Handling Node.js runtime...
 if /i "%BUILD_EXE%"=="true" (
   echo Skipping Node runtime download because backend .exe will be used.
 ) else (
   set NODE_VER=v18.20.3
   set "NODE_ZIP=node-!NODE_VER!-win-x64.zip"
   set "NODE_URL=https://nodejs.org/dist/!NODE_VER!/!NODE_ZIP!"
   rem Try download; if zip exists, expand; else fallback to local copy
   powershell -NoProfile -Command "try {Invoke-WebRequest -UseBasicParsing -Uri '!NODE_URL!' -OutFile '!OUTDIR!\runtime\!NODE_ZIP!'} catch {exit 1}" >nul 2>&1
   if exist "!OUTDIR!\runtime\!NODE_ZIP!" (
     powershell -NoProfile -Command "Expand-Archive -Force '!OUTDIR!\runtime\!NODE_ZIP!' '!OUTDIR!\runtime'"
     del "!OUTDIR!\runtime\!NODE_ZIP!" >nul 2>&1
     for /d %%D in ("!OUTDIR!\runtime\node-v*") do (
       xcopy /e /i /y "%%~fD\*" "!OUTDIR!\runtime\node" >nul
       rmdir /s /q "%%~fD"
     )
     echo [INFO] Node runtime downloaded and prepared.
   ) else (
     echo [WARN] Failed to download Node runtime. Falling back to local Node.js copy...
     for /f "delims=" %%N in ('where node') do set "NODE_SRC=%%~dpN"
     if not defined NODE_SRC (
       echo [ERROR] Local Node.js not found in PATH. & exit /b 1
     )
     if not exist "!NODE_SRC!node.exe" (
       echo [ERROR] Local Node.js path invalid: !NODE_SRC! & exit /b 1
     )
     xcopy /e /i /y "!NODE_SRC!" "!OUTDIR!\runtime\node" >nul
      echo [INFO] Copied local Node.js from !NODE_SRC! to runtime.
     )
   )
 )

:: Download nginx (Windows)
echo [6/8] Downloading nginx...
set NGINX_VER=1.24.0
set NGINX_ZIP=nginx-%NGINX_VER%.zip
set NGINX_URL=http://nginx.org/download/%NGINX_ZIP%
powershell -NoProfile -Command "try {Invoke-WebRequest -UseBasicParsing -Uri '%NGINX_URL%' -OutFile '%OUTDIR%\nginx\%NGINX_ZIP%'} catch {exit 1}" || (echo [ERROR] Failed to download nginx & exit /b 1)
powershell -NoProfile -Command "Expand-Archive -Force '%OUTDIR%\nginx\%NGINX_ZIP%' '%OUTDIR%\nginx'"
del "%OUTDIR%\nginx\%NGINX_ZIP%" >nul 2>&1
for /d %%D in ("%OUTDIR%\nginx\nginx-*") do (
  xcopy /e /i /y "%%~fD" "%OUTDIR%\nginx" >nul
  rmdir /s /q "%%~fD"
  goto :nginx_done
)
:nginx_done

:: Write nginx.conf
 echo [7/8] Writing nginx.conf ...
 (
   echo worker_processes  1;
   echo events {
   echo   worker_connections  1024;
   echo }
   echo http {
   echo   include       mime.types;
   echo   default_type  application/octet-stream;
   echo   sendfile        on;
   echo   access_log logs/access.log;
   echo   error_log  logs/error.log info;
   echo   keepalive_timeout  65;
   echo   server {
   echo     listen       8080;
   echo     server_name  localhost;
   echo     root   ..\frontend;
   echo     location /api/ {
   echo       proxy_pass http://127.0.0.1:5001/;
   echo       proxy_set_header Host $host;
   echo       proxy_set_header X-Real-IP $remote_addr;
   echo       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   echo     }
   echo     location / {
   echo       try_files $uri /index.html;
   echo     }
   echo   }
   echo }
 ) > "%OUTDIR%\nginx\conf\nginx.conf"

:: Start/Stop scripts inside package
 echo [8/8] Creating start/stop scripts and README...
 (
   echo @echo off
   echo setlocal
   echo set ROOT=%%~dp0
   echo if not exist "%%ROOT%%logs" mkdir "%%ROOT%%logs"
   echo if not exist "%%ROOT%%backend\logs" mkdir "%%ROOT%%backend\logs"
   echo if not exist "%%ROOT%%nginx\logs" mkdir "%%ROOT%%nginx\logs"
   echo if not exist "%%ROOT%%logs\backend.out.log" type nul ^> "%%ROOT%%logs\backend.out.log"
   echo if not exist "%%ROOT%%logs\backend.err.log" type nul ^> "%%ROOT%%logs\backend.err.log"
   if /i "%BUILD_EXE%"=="true" (
     echo set NODE_SQLITE3_BINARY=%%ROOT%%backend\bin\node_sqlite3.node
     echo set SQLITE3_BINARY_PATH=%%ROOT%%backend\bin\node_sqlite3.node
     echo echo Starting backend ^(exe^) on PORT 5001 ...
     echo start "SmileSync Backend" cmd /c "cd %%ROOT%%backend\bin ^&^& set PORT=5001 ^&^& smilesync-backend.exe ^>^> \"%%ROOT%%logs\backend.out.log\" 2^>^> \"%%ROOT%%logs\backend.err.log\""
   ) else (
     echo set PATH=%%ROOT%%runtime\node\;%%PATH%%
     echo echo Starting backend ^(node^) on PORT 5001 ...
     echo start "SmileSync Backend" cmd /c "cd %%ROOT%%backend ^&^& set PORT=5001 ^&^& node index.js ^>^> \"%%ROOT%%logs\backend.out.log\" 2^>^> \"%%ROOT%%logs\backend.err.log\""
   )
   echo echo Starting nginx on http://localhost:8080 ...
   echo pushd %%ROOT%%nginx ^>nul
   echo start "SmileSync Nginx" cmd /c "nginx.exe -p %%ROOT%%nginx -c conf\nginx.conf"
   echo popd ^>nul
   echo echo.
   echo echo Frontend: http://localhost:8080
   echo echo API:      http://localhost:5001
   echo echo Logs folder: %%ROOT%%logs ^(backend.out.log, backend.err.log^)
   echo echo Nginx logs:  %%ROOT%%nginx\logs ^(access.log, error.log^)
   echo pause
 ) > "%OUTDIR%\start.bat"

(
  echo @echo off
  echo setlocal
  echo set ROOT=%%~dp0
  echo echo Stopping nginx...
  echo pushd %%ROOT%%nginx ^>nul
  echo nginx.exe -p %%ROOT%%nginx -c conf\nginx.conf -s quit
  echo popd ^>nul
  echo echo Stopping backend...
  echo for /f "tokens=2" %%%%p in ^('tasklist ^| findstr /i node.exe'^) do taskkill /f /pid %%%%p ^>nul 2^>^&1
  echo for /f "tokens=2" %%%%p in ^('tasklist ^| findstr /i smilesync-backend.exe'^) do taskkill /f /pid %%%%p ^>nul 2^>^&1
  echo echo Done.
  echo pause
) > "%OUTDIR%\stop.bat"

(
  echo SmileSync Offline Package ^(Windows^)
  echo.
  echo Start: double-click start.bat
  echo Stop:  double-click stop.bat
  echo.
  echo Components:
  echo  - Nginx ^(serves frontend at http://localhost:8080 and proxies /api to backend^)
  echo  - Backend ^(Node.js Express on http://localhost:5001^)
  echo.
  echo Notes:
  echo  - Requires no installation. All binaries included when using Node runtime.
  echo  - If backend exe is included, Node runtime is not required.
  echo  - To change ports, edit nginx\conf\nginx.conf and start.bat ^(PORT variable^).
) > "%OUTDIR%\README.txt"

:: Zip package
echo Creating archive %OUTZIP% ...
powershell -NoProfile -Command "Compress-Archive -Path '%OUTDIR%\*' -DestinationPath '%OUTZIP%' -Force"
echo Done. Created %OUTZIP%

popd
exit /b 0