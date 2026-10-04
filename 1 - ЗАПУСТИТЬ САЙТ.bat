@echo off
chcp 65001 >nul
cd /d "%~dp0"

powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/' -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }"
if %errorlevel%==0 (
  start "" "http://127.0.0.1:4173/"
  exit
)

where node >nul 2>nul
if %errorlevel%==0 (
  start "Focus Deck - server" cmd /k "cd /d ""%~dp0"" ^&^& node scripts\server.mjs"
  goto wait_for_server
)

where py >nul 2>nul
if %errorlevel%==0 (
  start "Focus Deck - server" cmd /k "cd /d ""%~dp0"" ^&^& py -3 -m http.server 4173 --bind 127.0.0.1"
  goto wait_for_server
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "Focus Deck - server" cmd /k "cd /d ""%~dp0"" ^&^& python -m http.server 4173 --bind 127.0.0.1"
  goto wait_for_server
)

echo Ne naiden Node.js ili Python. Ustanovite odnu iz etih programm.
pause
exit /b 1

:wait_for_server
powershell -NoProfile -Command "$ok=$false; 1..20 | ForEach-Object { try { Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/' -TimeoutSec 1 | Out-Null; $ok=$true; break } catch { Start-Sleep -Milliseconds 500 } }; if ($ok) { exit 0 } else { exit 1 }"
if %errorlevel%==0 (
  start "" "http://127.0.0.1:4173/"
  exit
)

echo Server ne zapustilsya. Proverte soobshenie v chernom okne.
pause
