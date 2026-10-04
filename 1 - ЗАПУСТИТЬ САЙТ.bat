@echo off
chcp 65001 >nul
cd /d "%~dp0"

powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/' -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }"
if %errorlevel%==0 (
  start "" "http://127.0.0.1:4173/"
  exit
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "Focus Deck - server" cmd /k "cd /d ""%~dp0"" ^&^& echo NE ZAKRYVAYTE ETO OKNO POKA RABOTAETE S SAITOM ^&^& python -m http.server 4173 --bind 127.0.0.1"
  timeout /t 2 /nobreak >nul
  start "" "http://127.0.0.1:4173/"
  exit
)

echo Python ne naiden. Ustanovite Python ili zapustite drugoi lokalnyi HTTP-server na porte 4173.
pause
