@echo off
title AquaPulse AI Launcher
echo ========================================================
echo          AquaPulse AI - NEXTGEN AI (SRIT)
echo ========================================================
echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "AquaPulse Backend" cmd /k "cd /d %~dp0 && set PYTHONPATH=. && ..\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak > nul

echo [2/2] Starting React Vite Frontend on http://127.0.0.1:5173 ...
start "AquaPulse Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 2 /nobreak > nul

echo.
echo ========================================================
echo All AquaPulse AI services are now running!
echo Frontend UI:      http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo ========================================================
echo.
start http://localhost:5173
