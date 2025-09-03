#!/usr/bin/env bash
set -euo pipefail

# SmileSync - Local Dev Down (macOS/Linux)

echo "Stopping SmileSync dev processes..."

pids=$(pgrep -f "(PORT=5001|PORT=3000|nodemon index.js|react-scripts start)" || true)
if [ -n "${pids:-}" ]; then
  kill $pids 2>/dev/null || true
fi

# Fallback by ports
for p in $(seq 3000 3010) $(seq 5001 5010); do
  pid=$(lsof -ti tcp:$p || true)
  if [ -n "$pid" ]; then
    kill $pid 2>/dev/null || true
  fi
done

echo "Done."