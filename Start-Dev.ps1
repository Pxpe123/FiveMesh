$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

Set-Location $projectRoot
dotnet build (Join-Path $projectRoot "Engine\Engine.csproj")

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$projectRoot'; npm.cmd run dev --prefix Server"
) -WindowStyle Normal

npm.cmd run dev --prefix Web
