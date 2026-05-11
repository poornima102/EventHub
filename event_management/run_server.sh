#!/bin/bash

# Event Management System - Development Server Startup Script for macOS/Linux

echo "========================================"
echo " Event Management System - Startup"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "ERROR: Virtual environment not found!"
    echo "Please run: python3 -m venv venv"
    echo "Then run: pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to activate virtual environment!"
    exit 1
fi

echo "[OK] Virtual environment activated"

# Check if Django is installed
python -m pip show django > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Django not installed!"
    echo "Please run: pip install -r requirements.txt"
    exit 1
fi

echo "[OK] Django is installed"

# Run migrations
echo ""
echo "Running database migrations..."
python manage.py migrate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to run migrations!"
    exit 1
fi

echo "[OK] Migrations completed"

# Start development server
echo ""
echo "========================================"
echo " Development Server Starting..."
echo "========================================"
echo ""
echo "Server URL: http://localhost:8000"
echo "Admin URL:  http://localhost:8000/admin"
echo "API URL:    http://localhost:8000/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

python manage.py runserver
