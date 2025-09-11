#!/bin/bash

# Start Servers Script
# This script starts both the backend and frontend servers

echo "🚀 Starting Ecom-MultiRole Servers..."
echo ""

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

# Function to start backend server
start_backend() {
    echo "🔧 Starting Backend Server..."
    cd server
    npm install
    npm run dev &
    BACKEND_PID=$!
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    cd ..
}

# Function to start frontend server
start_frontend() {
    echo "🎨 Starting Frontend Server..."
    cd client
    npm install
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
    cd ..
}

# Start servers
start_backend
sleep 3
start_frontend

echo ""
echo "🎉 Both servers are starting up!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/api-docs"
echo "🏥 Health Check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait




