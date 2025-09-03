@echo off
setlocal EnableExtensions EnableDelayedExpansion

:: SmileSync - Local Dev Up (Windows)
:: Starts backend and frontend with minimal deps; backend fixed to 5001 (matches CRA proxy)

set PROJECT_ROOT=%~dp0..
pushd %PROJECT_ROOT%

:: Ensure npm is available
where npm >nul 2>&1 || (
  echo [ERROR] npm not found. Please install Node.js 18+.
  popd
  exit /b 1
)

:: Install deps if missing
if not exist node_modules (
  echo Installing root deps...
  call npm install || (echo [ERROR] Failed to install root deps & popd & exit /b 1)
)

if not exist app\node_modules (
  echo Installing frontend deps...
  pushd app || (echo [ERROR] Cannot enter app directory & popd & exit /b 1)
  call npm install || (echo [ERROR] Frontend deps install failed & popd & popd & exit /b 1)
  popd
)

if not exist backend\node_modules (
  echo Installing backend deps...
  pushd backend || (echo [ERROR] Cannot enter backend directory & popd & exit /b 1)
  call npm install || (echo [ERROR] Backend deps install failed & popd & popd & exit /b 1)
  popd
)

:: Ports
set FRONTEND_PORT=3000
set BACKEND_PORT=5001

:: Ensure backend port 5001 is free
for /f "tokens=5" %%a in ('netstat -ano ^| find ":%BACKEND_PORT% " ^| find "LISTENING"') do set B_IN_USE=1
if defined B_IN_USE (
  echo [ERROR] Backend port %BACKEND_PORT% is in use. Please run scripts\dev-down.bat or free the port.
  popd
  exit /b 1
)

:: Find a free frontend port starting at 3000
for /f "tokens=5" %%a in ('netstat -ano ^| find ":%FRONTEND_PORT% " ^| find "LISTENING"') do set F_IN_USE=1
if defined F_IN_USE (
  for /l %%p in (3000,1,3100) do (
    set "hit="
    for /f "tokens=5" %%a in ('netstat -ano ^| find ":%%p " ^| find "LISTENING"') do set hit=1
    if not defined hit (
      set FRONTEND_PORT=%%p
      goto :found_f
    )
  )
  echo [ERROR] No free frontend port found in 3000-3100 & popd & exit /b 1
)
:found_f

echo Starting backend on %BACKEND_PORT% ...
start "SmileSync Backend" cmd /c "cd backend && set PORT=%BACKEND_PORT% && npx nodemon index.js"

echo Starting frontend on %FRONTEND_PORT% ...
start "SmileSync Frontend" cmd /c "cd app && set PORT=%FRONTEND_PORT% && npm start"

echo.
echo Backend:  http://localhost:%BACKEND_PORT%
echo Frontend: http://localhost:%FRONTEND_PORT%
echo Use scripts\dev-down.bat to stop.
popd
exit /b 0