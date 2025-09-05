#!/usr/bin/env bash
set -euo pipefail

# SmileSync - macOS/Linux Portable Production Packager
# Produces a tar.gz with nginx, Node runtime, backend (prod), frontend build, and start/stop scripts

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo 0.0.0)
OUTDIR="deployment/SmileSync-${VERSION}-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m)"
OUTTGZ="${OUTDIR}.tar.gz"

rm -rf "$OUTDIR" "$OUTTGZ"
mkdir -p "$OUTDIR/nginx/conf" "$OUTDIR/backend" "$OUTDIR/frontend" "$OUTDIR/runtime/node" "$OUTDIR/scripts"

# Build frontend
( cd app && ( [ -f package-lock.json ] && npm ci || npm install ) && npm run build )
cp -r app/build/* "$OUTDIR/frontend/"

# Backend prod deps
cp -r backend/* "$OUTDIR/backend/"
( cd "$OUTDIR/backend" && rm -rf node_modules && ( [ -f package-lock.json ] && npm ci --omit=dev || npm install --production ) )

# Node runtime (determine platform)
NODE_VER=v18.20.3
case "$(uname -s)" in
  Linux) NODE_TARBALL="node-${NODE_VER}-linux-x64.tar.xz" ;;
  Darwin) NODE_TARBALL="node-${NODE_VER}-darwin-x64.tar.xz" ;;
  *) echo "Unsupported OS"; exit 1;;
esac
NODE_URL="https://nodejs.org/dist/${NODE_VER}/${NODE_TARBALL}"

curl -fsSL "$NODE_URL" -o "$OUTDIR/runtime/${NODE_TARBALL}"
( cd "$OUTDIR/runtime" && tar -xf "$NODE_TARBALL" && rm "$NODE_TARBALL" )
NODE_DIR=$(find "$OUTDIR/runtime" -maxdepth 1 -type d -name "node-v*" | head -n1)
mv "$NODE_DIR" "$OUTDIR/runtime/node"

# nginx binary (expect system curl to fetch official binary/distribution)
NGINX_CONF="$OUTDIR/nginx/conf/nginx.conf"
cat > "$NGINX_CONF" <<'NGINX'
worker_processes 1;
events { worker_connections 1024; }
http {
  include       mime.types;
  default_type  application/octet-stream;
  sendfile        on;
  keepalive_timeout  65;
  server {
    listen 8080;
    server_name localhost;
    root   FRONTEND_ROOT;
    location /api/ {
      proxy_pass http://127.0.0.1:5001/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    location / {
      try_files $uri /index.html;
    }
  }
}
NGINX
# Replace FRONTEND_ROOT with absolute path placeholder at runtime via start.sh

# Start/Stop scripts
cat > "$OUTDIR/start.sh" <<'STARTSH'
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
export PATH="$ROOT/runtime/node/bin:$PATH"

# Start backend
( cd "$ROOT/backend" && PORT=5001 node index.js ) &
BACK_PID=$!

# Start nginx (using system nginx if available, else try binary if present)
NGINX_BIN=$(command -v nginx || true)
if [ -z "$NGINX_BIN" ] && [ -x "$ROOT/nginx/sbin/nginx" ]; then
  NGINX_BIN="$ROOT/nginx/sbin/nginx"
fi
if [ -z "$NGINX_BIN" ]; then
  echo "nginx not found. Please install nginx or provide nginx binary in $ROOT/nginx"; kill $BACK_PID; exit 1
fi

CONF="$ROOT/nginx/conf/nginx.conf"
sed -i.bak "s|FRONTEND_ROOT|$ROOT/frontend|g" "$CONF" || true
"$NGINX_BIN" -p "$ROOT/nginx" -c "$CONF"

echo "Frontend: http://localhost:8080"
echo "API:      http://localhost:5001"
echo "Press Ctrl+C to stop"
trap '"$NGINX_BIN" -s stop 2>/dev/null || true; kill $BACK_PID 2>/dev/null || true; exit 0' INT TERM
wait $BACK_PID
STARTSH
chmod +x "$OUTDIR/start.sh"

cat > "$OUTDIR/stop.sh" <<'STOPSH'
#!/usr/bin/env bash
set -euo pipefail
NGINX_BIN=$(command -v nginx || true)
if [ -z "$NGINX_BIN" ] && [ -x "$(dirname "$0")/nginx/sbin/nginx" ]; then
  NGINX_BIN="$(dirname "$0")/nginx/sbin/nginx"
fi
"$NGINX_BIN" -s stop 2>/dev/null || true
# Kill backend by port
PID=$(lsof -ti tcp:5001 || true)
[ -n "$PID" ] && kill "$PID" 2>/dev/null || true
STOPSH
chmod +x "$OUTDIR/stop.sh"

# README
cat > "$OUTDIR/README.txt" <<README
SmileSync Portable Package ($(uname -s))

Start: ./start.sh
Stop:  ./stop.sh

Components:
 - Nginx (serves frontend at http://localhost:8080 and proxies /api to backend)
 - Backend (Node.js Express on http://localhost:5001)

Notes:
 - Node runtime included (no system install needed)
 - If system nginx is unavailable, place nginx binary under nginx/ matching your OS
 - Change ports by editing nginx/conf/nginx.conf and start.sh
README

# Archive
tar -czf "$OUTTGZ" -C "$(dirname "$OUTDIR")" "$(basename "$OUTDIR")"
echo "Created $OUTTGZ"