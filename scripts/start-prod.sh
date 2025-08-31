#!/bin/bash

echo "Starting SmileSync production application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16+ to continue."
    exit 1
fi

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Project root: $PROJECT_ROOT"

# Check if production build exists
if [ ! -d "$PROJECT_ROOT/app/build" ]; then
    echo "Production build not found. Building frontend..."
    cd "$PROJECT_ROOT/app"
    npm run build
    if [ $? -ne 0 ]; then
        echo "Error: Frontend build failed."
        exit 1
    fi
fi

# Check if dependencies are installed
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "Installing production dependencies..."
    cd "$PROJECT_ROOT"
    npm install --production
fi

# Create data directory for SQLite database
mkdir -p "$PROJECT_ROOT/backend/data"

# Set production environment
export NODE_ENV=production

echo "\n=== Starting SmileSync Production Application ==="
echo "Environment: Production"
echo "Database: SQLite (local)"
echo "===============================================\n"

# Start Electron app
cd "$PROJECT_ROOT"
npm run electron:prod &

ELECTRON_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "\nShutting down SmileSync application..."
    if [ ! -z "$ELECTRON_PID" ]; then
        kill $ELECTRON_PID 2>/dev/null
    fi
    echo "Application stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "SmileSync is running. Press Ctrl+C to stop."

# Wait for Electron to exit
wait $ELECTRON_PID
