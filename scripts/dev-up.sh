#!/usr/bin/env bash
set -euo pipefail

# SmileSync - Local Dev Up (macOS/Linux)
# Starts backend and frontend; backend fixed to 5001 (matches CRA proxy)

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm not found. Install Node.js 18+"; exit 1; }

install_if_missing() {
  local dir="$1"
  if [ ! -d "$dir/node_modules" ]; then
    echo "Installing deps in $dir ..."
    (cd "$dir" && npm install)
  fi
}

install_if_missing "."
install_if_missing "app"
install_if_missing "backend"

check_port() {
  local port="$1"
  if lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

find_free_port() {
  local start="$1"; local end="$2"; local p
  p="$start"
  while [ "$p" -le "$end" ]; do
    if ! check_port "$p"; then echo "$p"; return 0; fi
    p=$((p+1))
  done
  return 1
}

FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=5001

if check_port "$BACKEND_PORT"; then echo "[ERROR] Backend port $BACKEND_PORT is busy. Run ./scripts/dev-down.sh or free the port."; exit 1; fi

if check_port "$FRONTEND_PORT"; then FRONTEND_PORT=$(find_free_port 3000 3100) || { echo "No free frontend port"; exit 1; }; fi

echo "Starting backend on $BACKEND_PORT ..."
( cd backend && PORT="$BACKEND_PORT" npx nodemon index.js ) &
BACK_PID=$!

echo "Starting frontend on $FRONTEND_PORT ..."
( cd app && PORT="$FRONTEND_PORT" npm start ) &
FRONT_PID=$!

trap 'echo; echo Stopping...; kill $BACK_PID $FRONT_PID 2>/dev/null || true; exit 0' INT TERM

echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Backend:  http://localhost:$BACKEND_PORT"
echo "Press Ctrl+C to stop or run ./scripts/dev-down.sh"

wait $BACK_PID $FRONT_PID