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

# Function to kill process on specific port
kill_port() {
    local port=$1
    local port_pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$port_pid" ]; then
        echo "Stopping process on port $port (PID: $port_pid)..."
        kill -TERM $port_pid 2>/dev/null
        sleep 2
        # Force kill if still running
        if kill -0 $port_pid 2>/dev/null; then
            echo "Force stopping process on port $port..."
            kill -9 $port_pid 2>/dev/null
        fi
    fi
}

# Check common development ports
kill_port 3000  # React frontend
kill_port 5001  # Backend API
kill_port 8080  # Alternative development server

# Check for any additional ports that might be in use
echo "Scanning for other SmileSync-related processes..."
for port in $(seq 3001 3010); do
    port_pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$port_pid" ]; then
        # Check if it's a Node.js process
        if ps -p $port_pid -o comm= | grep -q node; then
            echo "Found Node.js process on port $port, stopping..."
            kill_port $port
        fi
    fi
done

echo "\n=== SmileSync Development Environment Stopped ==="
echo "All development processes have been terminated."
echo "================================================="
