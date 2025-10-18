#!/bin/bash

# Startup script for Rema 1000 Meal Planner Backend

echo "🚀 Starting Rema 1000 Meal Planner API..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env || echo "⚠️  Please create .env file manually with your database settings"
fi

# Start the FastAPI server
echo "🌟 Starting FastAPI server on http://localhost:8000"
echo "📚 API documentation available at http://localhost:8000/docs"
echo "🔍 Health check at http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"

python main.py