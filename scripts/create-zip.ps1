# Script to create a clean, portable zip file of SwiftPOS for VS Code
$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projectRoot = Split-Path -Parent $PSScriptRoot
$zipPath = Join-Path $projectRoot "swiftpos-mern-project.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Write-Host "Creating clean SwiftPOS zip archive at: $zipPath" -ForegroundColor Cyan

# Prepare temp directory
$tempDir = Join-Path $env:TEMP "swiftpos-export"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copy root files and selected folders, excluding node_modules, .git, data
$excludeDirs = @('node_modules', '.git', 'dist', 'data')

Get-ChildItem -Path $projectRoot | ForEach-Object {
    if ($_.PSIsContainer) {
        if ($excludeDirs -notcontains $_.Name) {
            Copy-Item -Path $_.FullName -Destination (Join-Path $tempDir $_.Name) -Recurse -Force
        }
    } else {
        if ($_.Name -notmatch '\.zip$') {
            Copy-Item -Path $_.FullName -Destination $tempDir -Force
        }
    }
}

# Remove node_modules inside client and server if present
$clientNodeModules = Join-Path $tempDir "client\node_modules"
if (Test-Path $clientNodeModules) { Remove-Item $clientNodeModules -Recurse -Force }
$serverNodeModules = Join-Path $tempDir "server\node_modules"
if (Test-Path $serverNodeModules) { Remove-Item $serverNodeModules -Recurse -Force }

# Compress archive using .NET ZipFile
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

# Cleanup temp
Remove-Item $tempDir -Recurse -Force

if (Test-Path $zipPath) {
    $zipSize = (Get-Item $zipPath).Length / 1MB
    Write-Host "🎉 ZIP Archive created successfully!" -ForegroundColor Green
    Write-Host "File: $zipPath" -ForegroundColor Yellow
    Write-Host ("Size: {0:N2} MB" -f $zipSize) -ForegroundColor Green
} else {
    Write-Host "Error creating zip file." -ForegroundColor Red
}
