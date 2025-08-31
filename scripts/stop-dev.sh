#!/bin/bash

echo "Stopping SmileSync development environment..."

# Function to safely kill processes
safe_kill() {
    local process_name=$1
    local pids=$(pgrep -f "$process_name")
    
    if [ ! -z "$pids" ]; then
        echo "Stopping $process_name processes..."
        pkill -f "$process_name"
        sleep 2
        
        # Force kill if still running
        local remaining_pids=$(pgrep -f "$process_name")
        if [ ! -z "$remaining_pids" ]; then
            echo "Force stopping $process_name processes..."
            pkill -9 -f "$process_name"
        fi
    fi
}

# Kill backend processes
safe_kill "nodemon"
safe_kill "node.*backend.*index.js"

# Kill frontend processes
safe_kill "react-scripts"
safe_kill "webpack"

# Kill any Electron processes (in case they're running)
safe_kill "electron"

# Kill any remaining Node.js processes related to SmileSync
safe_kill "node.*smilesync"

# Clean up any orphaned processes on specific ports
echo "Checking for processes on development ports..."

# Check port 3000 (React)
PORT_3000_PID=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PORT_3000_PID" ]; then
    echo "Stopping process on port 3000..."
    kill -9 $PORT_3000_PID 2>/dev/null
fi

# Check port 5000 (Backend)
PORT_5000_PID=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$PORT_5000_PID" ]; then
    echo "Stopping process on port 5000..."
    kill -9 $PORT_5000_PID 2>/dev/null
fi

echo "\n=== SmileSync Development Environment Stopped ==="
echo "All development processes have been terminated."
echo "================================================="
