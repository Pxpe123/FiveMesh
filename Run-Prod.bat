@echo off
setlocal

cd /d "%~dp0"

if not exist "build\engine\Engine.dll" (
  echo Missing build\engine\Engine.dll.
  echo Run Build-All.bat first.
  pause
  exit /b 1
)

if not exist "build\web\index.html" (
  echo Missing build\web\index.html.
  echo Run Build-All.bat first.
  pause
  exit /b 1
)

where dotnet >nul 2>nul
if errorlevel 1 (
  echo Missing .NET SDK/runtime. Install .NET, then run this file again.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Missing Node.js/npm. Install Node.js, then run this file again.
  pause
  exit /b 1
)

set "PORT=4173"
set "WEB_ORIGIN=http://localhost:4173"
set "ENGINE_EXECUTABLE_PATH=%~dp0build\engine\Engine.dll"
set "FIVEMESH_ROOT=%~dp0"
set "FIVEMESH_MODE=built"
set "WEB_DIRECTORY=%~dp0build\web"

echo Starting built FiveMesh server on http://localhost:4173
set "EXAMPLES_DIRECTORY=%~dp0build\examples\assets"
start "FiveMesh Built API" cmd /k "cd /d ""%~dp0"" && npm.cmd run start:server"

echo.
echo Built app is starting.
echo Web and API: http://localhost:4173
echo.
pause
