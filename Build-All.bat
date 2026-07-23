@echo off
setlocal

cd /d "%~dp0"

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

echo Building FiveMesh into the root build folder...
if exist "build" rmdir /s /q "build"
mkdir "build"
mkdir "build\examples"

dotnet publish apps\engine\Engine.csproj -c Release -o build\engine --no-restore
if errorlevel 1 goto failed

call npm.cmd run build --prefix apps/server
if errorlevel 1 goto failed

call npm.cmd run build --prefix apps/web
if errorlevel 1 goto failed

xcopy "apps\web\dist" "build\web" /E /I /Y >nul
if errorlevel 1 goto failed

xcopy "examples\assets" "build\examples\assets" /E /I /Y >nul
if errorlevel 1 goto failed

if exist "build\server\node_modules" rmdir /s /q "build\server\node_modules"
mklink /J "build\server\node_modules" "apps\server\node_modules" >nul
if errorlevel 1 goto failed

echo.
echo Build complete.
echo Engine: build\engine
echo Server: build\server
echo Web: build\web
echo.
pause
exit /b 0

:failed
echo.
echo Build failed.
pause
exit /b 1
