Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         AquaPulse AI - NEXTGEN AI (SRIT)              " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot
Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; `$env:PYTHONPATH='.'; & 'C:\Users\Pc\Documents\.venv\Scripts\python.exe' -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting React Vite Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev -- --host 127.0.0.1 --port 5173"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Services running! Opening browser at http://localhost:5173" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Start-Process "http://localhost:5173"
