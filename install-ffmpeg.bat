@echo off
REM FFmpeg Installation Script for Windows
REM This script installs FFmpeg for the YouTube Downloader

echo.
echo ================================================
echo    YouTube Downloader - FFmpeg Installer
echo ================================================
echo.

REM Check if FFmpeg is already installed
ffmpeg -version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] FFmpeg is already installed!
    ffmpeg -version | findstr version
    exit /b 0
)

echo [!] FFmpeg is not installed. Installing now...
echo.

REM Check if winget is available
where winget >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using Windows Package Manager (winget) to install FFmpeg...
    winget install --id Gyan.FFmpeg --exact --interactive
    if %ERRORLEVEL% EQU 0 (
        echo [OK] FFmpeg installed successfully!
        ffmpeg -version | findstr version
        exit /b 0
    )
)

REM Check if chocolatey is available
where choco >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using Chocolatey to install FFmpeg...
    choco install ffmpeg -y
    if %ERRORLEVEL% EQU 0 (
        echo [OK] FFmpeg installed successfully!
        ffmpeg -version | findstr version
        exit /b 0
    )
)

REM If package managers are not available, show manual installation instructions
echo.
echo [!] FFmpeg installation requires one of the following:
echo    1. Windows Package Manager (winget)
echo    2. Chocolatey (https://chocolatey.org)
echo    3. Manual download (https://ffmpeg.org/download.html)
echo.
echo [MANUAL INSTALLATION]
echo 1. Go to https://ffmpeg.org/download.html
echo 2. Download the Windows build
echo 3. Extract to C:\ffmpeg
echo 4. Add C:\ffmpeg\bin to your system PATH
echo 5. Restart your terminal and try again
echo.
echo Or install via Chocolatey:
echo    choco install ffmpeg
echo.
pause
exit /b 1
