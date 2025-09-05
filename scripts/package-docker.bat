@echo off
setlocal EnableExtensions EnableDelayedExpansion

:: SmileSync - Docker Production Packager (Windows)

set PROJECT_ROOT=%~dp0..
pushd %PROJECT_ROOT%

for /f %%v in ('node -p "require('./package.json').version"') do set VERSION=%%v
if not defined VERSION set VERSION=0.0.0
set OUTDIR=deployment\docker-bundle

if exist "%OUTDIR%" rmdir /s /q "%OUTDIR%"
mkdir "%OUTDIR%"

:: Write nginx.conf for Docker (frontend)
(
  echo server {
  echo   listen 80;
  echo   server_name _;
  echo   root /usr/share/nginx/html;
  echo   location /api/ {
  echo     proxy_pass http://backend:5001/;
  echo     proxy_set_header Host ^$host;
  echo     proxy_set_header X-Real-IP ^$remote_addr;
  echo     proxy_set_header X-Forwarded-For ^$proxy_add_x_forwarded_for;
  echo   }
  echo   location / {
  echo     try_files ^$uri /index.html;
  echo   }
  echo }
) > "%OUTDIR%\nginx.conf"

:: Create Dockerfiles
(
  echo FROM node:18-alpine AS build-frontend
  echo WORKDIR /app
  echo COPY app/package*.json ./
  echo RUN npm ci
  echo COPY app .
  echo RUN npm run build
  echo FROM nginx:alpine AS frontend
  echo COPY --from=build-frontend /app/build /usr/share/nginx/html
  echo COPY deployment/docker-bundle/nginx.conf /etc/nginx/conf.d/default.conf
) > "%OUTDIR%\Dockerfile.frontend"

(
  echo FROM node:18-alpine AS backend
  echo WORKDIR /app
  echo COPY backend/package*.json ./
  echo RUN npm ci --omit=dev
  echo COPY backend .
  echo EXPOSE 5001
  echo ENV PORT=5001 NODE_ENV=production
  echo CMD ["node","index.js"]
) > "%OUTDIR%\Dockerfile.backend"

:: docker-compose.yml
(
  echo version: '3'
  echo services:
  echo   backend:
  echo     build:
  echo       context: ..
  echo       dockerfile: deployment/docker-bundle/Dockerfile.backend
  echo     ports:
  echo       - "5001:5001"
  echo   frontend:
  echo     build:
  echo       context: ..
  echo       dockerfile: deployment/docker-bundle/Dockerfile.frontend
  echo     ports:
  echo       - "8080:80"
  echo     depends_on:
  echo       - backend
) > "%OUTDIR%\docker-compose.yml"

:: Convenience scripts
(
  echo @echo off
  echo docker compose -f "%OUTDIR%\docker-compose.yml" up -d --build
) > "%OUTDIR%\start.bat"
(
  echo #!/usr/bin/env bash
  echo docker compose -f "$(dirname "$0")/docker-compose.yml" up -d --build
) > "%OUTDIR%\start.sh"
(
  echo @echo off
  echo docker compose -f "%OUTDIR%\docker-compose.yml" down
) > "%OUTDIR%\stop.bat"
(
  echo #!/usr/bin/env bash
  echo docker compose -f "$(dirname "$0")/docker-compose.yml" down
) > "%OUTDIR%\stop.sh"

echo Docker bundle is ready in %OUTDIR%
popd
exit /b 0