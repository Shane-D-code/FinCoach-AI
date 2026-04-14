@echo off
echo Starting ML Service for FinCoach-AI...
cd /d FinCoach-AI
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im uvicorn.exe >nul 2>&1
timeout /t 2 >nul
pip install -r requirements.txt --quiet
python ml_main_fixed.py
pause
