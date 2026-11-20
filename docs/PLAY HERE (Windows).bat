@echo off
cd /d "%~dp0"
echo Hachi Hops Home! is starting at http://localhost:8000 ... close this window to stop.
start "" http://localhost:8000
python -m http.server 8000
