#!/bin/bash

echo "Starting SmileSync development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16+ to continue."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm to continue."
    exit 1
fi

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Project root: $PROJECT_ROOT"

# Install dependencies if node_modules doesn't exist
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "Installing root dependencies..."
    cd "$PROJECT_ROOT"
    npm install
fi

if [ ! -d "$PROJECT_ROOT/app/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "$PROJECT_ROOT/app"
    npm install
fi

if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd "$PROJECT_ROOT/backend"
    npm install
fi

# Create data directory for SQLite database
mkdir -p "$PROJECT_ROOT/backend/data"

# Start backend server in background
echo "Starting backend server..."
cd "$PROJECT_ROOT/backend"
npx nodemon index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend React app in background
echo "Starting frontend React app..."
cd "$PROJECT_ROOT/app"
npm start &
FRONTEND_PID=$!

# Function to cleanup processes on exit
cleanup() {
    echo "\nShutting down development environment..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    # Kill any remaining processes
    pkill -f nodemon 2>/dev/null
    pkill -f react-scripts 2>/dev/null
    echo "Development environment stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "\n=== SmileSync Development Environment Started ==="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo "Press Ctrl+C to stop all services"
echo "================================================\n"

# Wait for both processes to exit
wait $BACKEND_PID $FRONTEND_PID
