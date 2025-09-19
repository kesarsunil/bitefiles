@echo off
echo ================================================
echo    Byte Sentinel - Ransomware Detection System
echo ================================================
echo.

echo [1/3] Starting Python Backend...
cd backend
if not exist "models" (
    echo Training ML models (this may take a few minutes)...
    python train_models.py
)

echo Starting Flask API server...
start "Backend Server" cmd /k "python app.py"

echo.
echo [2/3] Installing Frontend Dependencies...
cd ..
call npm install

echo.
echo [3/3] Starting React Frontend...
echo.
echo ================================================
echo   Access the application at:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ================================================
echo.

start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Check the opened terminal windows for status.
echo.
pause