@echo off
REM Event Management System - Development Server Startup Script for Windows

echo ========================================
echo  Event Management System - Startup
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then run: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment!
    pause
    exit /b 1
)

echo [OK] Virtual environment activated

REM Check if Django is installed
python -m pip show django >nul 2>&1
if errorlevel 1 (
    echo ERROR: Django not installed!
    echo Please run: pip install -r requirements.txt
    pause
    exit /b 1
)

echo [OK] Django is installed

REM Run migrations
echo.
echo Running database migrations...
python manage.py migrate
if errorlevel 1 (
    echo ERROR: Failed to run migrations!
    pause
    exit /b 1
)

echo [OK] Migrations completed

REM Start development server
echo.
echo ========================================
echo  Development Server Starting...
echo ========================================
echo.
echo Server URL: http://localhost:8000
echo Admin URL: http://localhost:8000/admin
echo API URL:   http://localhost:8000/api
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python manage.py runserver

pause
