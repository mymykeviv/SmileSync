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

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    while check_port $port; do
        port=$((port + 1))
        if [ $port -gt $((start_port + 100)) ]; then
            echo "Error: Could not find available port after checking 100 ports starting from $start_port"
            exit 1
        fi
    done
    echo $port
}

# Check for existing SmileSync processes
if pgrep -f "SmileSync\|smilesync" > /dev/null; then
    echo "⚠️  SmileSync appears to be already running!"
    echo "   You can access the existing application at:"
    if check_port 3000; then
        echo "   Frontend: http://localhost:3000"
    fi
    if check_port 5001; then
        echo "   Backend API: http://localhost:5001"
    fi
    echo ""
    read -p "Do you want to stop existing processes and start fresh? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stopping existing SmileSync processes..."
        pkill -f nodemon 2>/dev/null
        pkill -f react-scripts 2>/dev/null
        pkill -f webpack 2>/dev/null
        sleep 2
    else
        echo "Exiting. Use existing running application."
        exit 0
    fi
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
mkdir -p "$PROJECT_ROOT/data"

# Determine backend port
BACKEND_PORT=5001
if check_port $BACKEND_PORT; then
    echo "⚠️  Port $BACKEND_PORT is already in use."
    BACKEND_PORT=$(find_available_port 5001)
    echo "✅ Using alternative backend port: $BACKEND_PORT"
fi

# Start backend server in background
echo "Starting backend server on port $BACKEND_PORT..."
cd "$PROJECT_ROOT/backend"
PORT=$BACKEND_PORT npx nodemon index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Determine frontend port
FRONTEND_PORT=3000
if check_port $FRONTEND_PORT; then
    echo "⚠️  Port $FRONTEND_PORT is already in use."
    FRONTEND_PORT=$(find_available_port 3000)
    echo "✅ Using alternative frontend port: $FRONTEND_PORT"
fi

# Start frontend React app in background
echo "Starting frontend React app on port $FRONTEND_PORT..."
cd "$PROJECT_ROOT/app"
PORT=$FRONTEND_PORT npm start &
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
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Backend API: http://localhost:$BACKEND_PORT"
echo "Press Ctrl+C to stop all services"
echo "================================================\n"

# Wait for both processes to exit
wait $BACKEND_PID $FRONTEND_PID
