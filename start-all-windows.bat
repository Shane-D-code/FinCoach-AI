@echo off
echo ========================================
echo  FinCoach-AI Complete Startup - Windows
echo ========================================

REM Kill existing processes on ports (best effort)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /PID %%a /F >nul 2^>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /PID %%a /F >nul 2^>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /PID %%a /F >nul 2^>nul

REM Delete PID files
del .backend.pid .frontend.pid .ml.pid >nul 2^>nul

REM Start Backend
echo Starting Backend...
start "Backend" cmd /k "cd /d FinCoach-AI\backend ^& java -jar target\fincoach-backend-1.0.0.jar"

REM Start ML Service
timeout /t 3 /nobreak >nul
echo Starting ML Service...
cd /d FinCoach-AI
pip install -r requirements.txt --quiet
start "ML Service" cmd /k "python ml_main.py"

REM Start Frontend
timeout /t 3 /nobreak >nul
echo Starting Frontend...
npm install
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo All services launched!
echo ========================================
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8080
echo ML: http://localhost:8000/health
echo.
echo Check the new terminal windows for logs.
echo To stop: Use Ctrl+C in each terminal or taskkill /IM java.exe /IM python.exe /IM node.exe /F
pause
