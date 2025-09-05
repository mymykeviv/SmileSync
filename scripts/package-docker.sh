#!/usr/bin/env bash
set -euo pipefail

# SmileSync - Docker Production Packager (macOS/Linux)

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"
OUTDIR="deployment/docker-bundle"
rm -rf "$OUTDIR" && mkdir -p "$OUTDIR"

# nginx.conf for Docker frontend
cat > "$OUTDIR/nginx.conf" <<'NGINX'
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  location /api/ {
    proxy_pass http://backend:5001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
  location / {
    try_files $uri /index.html;
  }
}
NGINX

cat > "$OUTDIR/Dockerfile.frontend" <<'DFEF'
FROM node:18-alpine AS build-frontend
WORKDIR /app
COPY app/package*.json ./
RUN npm ci
COPY app .
RUN npm run build

FROM nginx:alpine AS frontend
COPY --from=build-frontend /app/build /usr/share/nginx/html
COPY deployment/docker-bundle/nginx.conf /etc/nginx/conf.d/default.conf
DFEF

cat > "$OUTDIR/Dockerfile.backend" <<'DFEB'
FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend .
EXPOSE 5001
ENV PORT=5001 NODE_ENV=production
CMD ["node","index.js"]
DFEB

cat > "$OUTDIR/docker-compose.yml" <<'COMPOSE'
version: '3'
services:
  backend:
    build:
      context: ..
      dockerfile: deployment/docker-bundle/Dockerfile.backend
    ports:
      - "5001:5001"
  frontend:
    build:
      context: ..
      dockerfile: deployment/docker-bundle/Dockerfile.frontend
    ports:
      - "8080:80"
    depends_on:
      - backend
COMPOSE

cat > "$OUTDIR/start.sh" <<'START'
#!/usr/bin/env bash
docker compose -f "$(dirname "$0")/docker-compose.yml" up -d --build
START
chmod +x "$OUTDIR/start.sh"

cat > "$OUTDIR/stop.sh" <<'STOP'
#!/usr/bin/env bash
docker compose -f "$(dirname "$0")/docker-compose.yml" down
STOP
chmod +x "$OUTDIR/stop.sh"

echo "Docker bundle ready in $OUTDIR"