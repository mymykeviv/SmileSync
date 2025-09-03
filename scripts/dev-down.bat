@echo off
setlocal EnableExtensions EnableDelayedExpansion

:: SmileSync - Local Dev Down (Windows)

echo Stopping SmileSync dev processes...

:: Kill nodemon windows with our title
taskkill /f /im node.exe /fi "WINDOWTITLE eq SmileSync Backend" >nul 2>&1
taskkill /f /im node.exe /fi "WINDOWTITLE eq SmileSync Frontend" >nul 2>&1

:: Fallback: kill common dev processes on ports 3000-3010,5001-5010
for /l %%p in (3000,1,3010) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| find ":%%p " ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
)
for /l %%p in (5001,1,5010) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| find ":%%p " ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
)

echo Done.
exit /b 0