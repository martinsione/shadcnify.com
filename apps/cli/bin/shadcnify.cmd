@echo off
setlocal enabledelayedexpansion

:: Get script directory
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

:: Set platform and arch
set "platform=win32"
set "arch=x64"
set "name=shadcnify-windows-%arch%"
set "binary=shadcnify.exe"

:: Search for binary
set "resolved="
set "current_dir=%SCRIPT_DIR%"

:search_loop
if exist "%current_dir%\node_modules\%name%\bin\%binary%" (
    set "resolved=%current_dir%\node_modules\%name%\bin\%binary%"
    goto :found
)

:: Move up one directory
for %%I in ("%current_dir%\..") do set "parent_dir=%%~fI"
if "%current_dir%"=="%parent_dir%" goto :not_found
set "current_dir=%parent_dir%"
goto :search_loop

:not_found
echo Error: Could not find %name% binary. 1>&2
echo Your package manager may have failed to install the correct platform binary. 1>&2
echo Try reinstalling: npm install -g shadcnify 1>&2
exit /b 1

:found
"%resolved%" %*
exit /b %ERRORLEVEL%

