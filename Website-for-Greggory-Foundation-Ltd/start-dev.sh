#!/bin/bash

echo "🚀 Starting Greggory Foundation Development Environment..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"
echo

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
    echo
fi

# Start both backend and frontend
echo "🌐 Starting backend and frontend..."
echo "Backend will run on: http://localhost:8080"
echo "Frontend will run on: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers"
echo

npm run dev
