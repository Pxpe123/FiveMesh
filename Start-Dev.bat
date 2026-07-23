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

if not exist "Server\node_modules" (
  echo Installing server packages...
  call npm.cmd install --prefix Server
  if errorlevel 1 (
    echo Server package install failed.
    pause
    exit /b 1
  )
)

if not exist "Web\node_modules" (
  echo Installing web packages...
  call npm.cmd install --prefix Web
  if errorlevel 1 (
    echo Web package install failed.
    pause
    exit /b 1
  )
)

echo Building FiveMesh engine...
dotnet build Engine\Engine.csproj
if errorlevel 1 (
  echo Engine build failed.
  pause
  exit /b 1
)

echo Starting API server on http://localhost:3000
start "FiveMesh API Server" cmd /k "cd /d ""%~dp0"" && npm.cmd run dev --prefix Server"

echo Starting web viewer on http://localhost:5173
start "FiveMesh Web Viewer" cmd /k "cd /d ""%~dp0"" && npm.cmd run dev --prefix Web"

echo.
echo Ready. Open http://localhost:5173 and drop your .yft/.ydr plus optional .ytd.
echo Close the two opened terminal windows when you are done testing.
echo.
pause
