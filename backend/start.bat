@echo off
REM Startup script for Rema 1000 Meal Planner Backend (Windows)

echo 🚀 Starting Rema 1000 Meal Planner API...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env 2>nul || echo ⚠️  Please create .env file manually with your database settings
)

REM Start the FastAPI server
echo 🌟 Starting FastAPI server on http://localhost:8000
echo 📚 API documentation available at http://localhost:8000/docs
echo 🔍 Health check at http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server

python main.py