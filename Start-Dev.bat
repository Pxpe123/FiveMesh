@echo off
setlocal

cd /d "%~dp0"

echo.
echo FiveMesh dev launcher
echo =====================
echo.

where dotnet >nul 2>nul
if errorlevel 1 (
  echo Missing .NET SDK. Install .NET, then run this file again.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Missing Node.js/npm. Install Node.js, then run this file again.
  pause
  exit /b 1
)

if not exist "apps\server\node_modules" (
  echo Installing server packages...
  call npm.cmd install --prefix apps/server
  if errorlevel 1 (
    echo Server package install failed.
    pause
    exit /b 1
  )
)

if not exist "apps\web\node_modules" (
  echo Installing web packages...
  call npm.cmd install --prefix apps/web
  if errorlevel 1 (
    echo Web package install failed.
    pause
    exit /b 1
  )
)

echo Building FiveMesh engine...
dotnet build apps\engine\Engine.csproj
if errorlevel 1 (
  echo Engine build failed.
  pause
  exit /b 1
)

echo Starting API server on http://localhost:3000
start "FiveMesh API Server" cmd /k "cd /d ""%~dp0"" && npm.cmd run dev --prefix apps/server"

echo Starting web viewer on http://localhost:5173
start "FiveMesh Web Viewer" cmd /k "cd /d ""%~dp0"" && npm.cmd run dev --prefix apps/web"

echo.
echo Ready. Open http://localhost:5173 and drop your .yft/.ydr plus optional .ytd.
echo Close the two opened terminal windows when you are done testing.
echo.
pause
