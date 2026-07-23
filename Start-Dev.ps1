$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

Set-Location $projectRoot
dotnet build (Join-Path $projectRoot "apps\engine\Engine.csproj")

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$projectRoot'; npm.cmd run dev --prefix apps/server"
) -WindowStyle Normal

npm.cmd run dev --prefix apps/web
