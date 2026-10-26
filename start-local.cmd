@echo off
python -u "%~dp0serve.py"
if errorlevel 1 pause
