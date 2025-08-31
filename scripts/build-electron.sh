#!/bin/bash

echo "Building SmileSync for distribution..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16+ to continue."
    exit 1
fi

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../" && pwd)"
echo "Project root: $PROJECT_ROOT"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf "$PROJECT_ROOT/dist"
rm -rf "$PROJECT_ROOT/app/build"

# Install dependencies if needed
echo "Checking dependencies..."
cd "$PROJECT_ROOT"
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

cd "$PROJECT_ROOT/app"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

cd "$PROJECT_ROOT/backend"
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Build the React frontend
echo "Building React frontend..."
cd "$PROJECT_ROOT/app"
npm run build

if [ $? -ne 0 ]; then
    echo "Error: Frontend build failed"
    exit 1
fi

# Build Electron application
echo "Building Electron application..."
cd "$PROJECT_ROOT"
npm run electron:dist

if [ $? -eq 0 ]; then
    echo "\n=== Build completed successfully ==="
    echo "Distribution files are in: $PROJECT_ROOT/dist"
    echo "======================================\n"
else
    echo "Error: Electron build failed"
    exit 1
fi