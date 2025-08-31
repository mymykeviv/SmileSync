#!/bin/bash

echo "Stopping SmileSync production application..."

# Function to safely kill processes
safe_kill() {
    local process_name=$1
    local pids=$(pgrep -f "$process_name")
    
    if [ ! -z "$pids" ]; then
        echo "Stopping $process_name processes..."
        pkill -f "$process_name"
        sleep 3
        
        # Force kill if still running
        local remaining_pids=$(pgrep -f "$process_name")
        if [ ! -z "$remaining_pids" ]; then
            echo "Force stopping $process_name processes..."
            pkill -9 -f "$process_name"
        fi
    fi
}

# Kill Electron processes
safe_kill "electron.*smilesync"
safe_kill "SmileSync"
safe_kill "electron"

# Kill backend processes (if running separately)
safe_kill "node.*backend.*index.js"
safe_kill "node.*smilesync.*backend"

# Clean up any remaining SmileSync processes
safe_kill "smilesync"

echo "\n=== SmileSync Production Application Stopped ==="
echo "All production processes have been terminated."
echo "==============================================="
