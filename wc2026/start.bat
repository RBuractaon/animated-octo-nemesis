@echo off
:: WC 2026 Bracket Intelligence — rogtowerdb startup (Windows)
:: Requires Python 3 in PATH. Node.js optional (needed for first build).

cd /d "%~dp0"

echo.
echo   WC 2026 Bracket Intelligence
echo   ------------------------------

:: Build if Node available
where node >nul 2>&1
if %errorlevel% == 0 (
    if not exist "node_modules\" (
        echo   [build] installing npm packages...
        call npm install --silent
    )
    echo   [build] building React app...
    call npm run build --silent
    echo   [build] done
) else (
    if exist "dist\" (
        echo   [build] Node not found, using existing dist\
    ) else (
        echo   [error] Node.js required for first build.
        echo           Download: https://nodejs.org
        pause
        exit /b 1
    )
)

echo.
echo   Starting server on port 5173...
echo   Open on any Tailscale device: http://100.115.169.40:5173
echo.
python server\serve.py 5173
pause
