# SmileSync Scripts Documentation

Comprehensive collection of development, build, and deployment scripts for the SmileSync dental clinic management system.

## 📋 Overview

This directory contains essential scripts for:

- **Development Workflow**: Local development server management
- **Build Process**: Production build automation
- **Database Management**: Schema migration and seeding
- **Testing Automation**: Test execution and coverage
- **Deployment**: Production deployment and CI/CD
- **Maintenance**: Backup, cleanup, and monitoring

## 🏗️ Script Architecture

```
scripts/
├── dev/                  # Development scripts
│   ├── start-dev.sh     # Start development servers
│   ├── setup-env.sh     # Environment setup
│   └── reset-db.sh      # Reset development database
├── build/               # Build scripts
│   ├── build-all.sh     # Build all components
│   ├── build-frontend.sh # Build React app
│   ├── build-backend.sh  # Build backend API
│   └── build-electron.sh # Build Electron app
├── deploy/              # Deployment scripts
│   ├── deploy-prod.sh   # Production deployment
│   ├── deploy-staging.sh # Staging deployment
│   └── health-check.sh  # Post-deployment checks
├── database/            # Database scripts
│   ├── migrate.sh       # Run migrations
│   ├── seed.sh          # Seed test data
│   ├── backup.sh        # Database backup
│   └── restore.sh       # Database restore
├── test/                # Testing scripts
│   ├── run-tests.sh     # Execute test suite
│   ├── coverage.sh      # Generate coverage
│   └── e2e.sh          # End-to-end tests
└── utils/               # Utility scripts
    ├── cleanup.sh       # Clean temporary files
    ├── monitor.sh       # System monitoring
    └── backup-all.sh    # Complete system backup
```

## 🚀 Development Scripts

### Start Development Environment
```bash
# Start all development servers
./scripts/dev/start-dev.sh

# Start specific components
./scripts/dev/start-dev.sh --frontend-only
./scripts/dev/start-dev.sh --backend-only
./scripts/dev/start-dev.sh --electron-only
```

**start-dev.sh** - Comprehensive development server management:
```bash
#!/bin/bash
# SmileSync Development Server Starter

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=3000
BACKEND_PORT=3001
ELECTRON_PORT=3002

# Parse command line arguments
FRONTEND_ONLY=false
BACKEND_ONLY=false
ELECTRON_ONLY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --frontend-only)
      FRONTEND_ONLY=true
      shift
      ;;
    --backend-only)
      BACKEND_ONLY=true
      shift
      ;;
    --electron-only)
      ELECTRON_ONLY=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🚀 Starting SmileSync Development Environment${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node --version)${NC}"
    exit 1
fi

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 1
    fi
    return 0
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}📱 Starting Frontend (React) on port $FRONTEND_PORT${NC}"
    if check_port $FRONTEND_PORT; then
        cd app
        npm install
        npm start &
        FRONTEND_PID=$!
        echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
        cd ..
    else
        echo -e "${RED}❌ Cannot start frontend - port $FRONTEND_PORT is busy${NC}"
    fi
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🔧 Starting Backend (Express) on port $BACKEND_PORT${NC}"
    if check_port $BACKEND_PORT; then
        cd backend
        npm install
        npm run dev &
        BACKEND_PID=$!
        echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
        cd ..
    else
        echo -e "${RED}❌ Cannot start backend - port $BACKEND_PORT is busy${NC}"
    fi
}

# Function to start Electron
start_electron() {
    echo -e "${BLUE}🖥️  Starting Electron Desktop App${NC}"
    npm run electron:dev &
    ELECTRON_PID=$!
    echo -e "${GREEN}✅ Electron started (PID: $ELECTRON_PID)${NC}"
}

# Start services based on flags
if [ "$FRONTEND_ONLY" = true ]; then
    start_frontend
elif [ "$BACKEND_ONLY" = true ]; then
    start_backend
elif [ "$ELECTRON_ONLY" = true ]; then
    start_electron
else
    # Start all services
    start_backend
    sleep 3  # Wait for backend to start
    start_frontend
    sleep 3  # Wait for frontend to start
    start_electron
fi

echo -e "${GREEN}🎉 Development environment is ready!${NC}"
echo -e "${BLUE}📍 Access points:${NC}"
echo -e "   Frontend: http://localhost:$FRONTEND_PORT"
echo -e "   Backend:  http://localhost:$BACKEND_PORT"
echo -e "   API Docs: http://localhost:$BACKEND_PORT/api-docs"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Trap Ctrl+C and cleanup
trap 'echo -e "\n${YELLOW}🛑 Stopping all services...${NC}"; kill $FRONTEND_PID $BACKEND_PID $ELECTRON_PID 2>/dev/null; exit 0' INT

# Wait for user input
wait
```

### Environment Setup
```bash
# Setup development environment
./scripts/dev/setup-env.sh

# Setup with specific Node version
./scripts/dev/setup-env.sh --node-version=20
```

**setup-env.sh** - Development environment initialization:
```bash
#!/bin/bash
# SmileSync Environment Setup

set -e

echo "🔧 Setting up SmileSync development environment..."

# Install dependencies for all components
echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd app && npm install && cd ..

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "📦 Installing testing dependencies..."
cd tests && npm install && cd ..

# Setup environment files
echo "📄 Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
fi

if [ ! -f app/.env ]; then
    cp app/.env.example app/.env
    echo "✅ Created app/.env file from template"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env file from template"
fi

# Initialize database
echo "🗄️  Initializing database..."
cd backend
npm run db:migrate
npm run db:seed
cd ..

echo "🎉 Development environment setup complete!"
echo "🚀 Run './scripts/dev/start-dev.sh' to start development servers"
```

### Database Reset
```bash
# Reset development database
./scripts/dev/reset-db.sh

# Reset with fresh seed data
./scripts/dev/reset-db.sh --fresh-seed
```

## 🏗️ Build Scripts

### Build All Components
```bash
# Build everything for production
./scripts/build/build-all.sh

# Build with specific environment
./scripts/build/build-all.sh --env=staging
```

**build-all.sh** - Complete production build:
```bash
#!/bin/bash
# SmileSync Complete Build Script

set -e

# Configuration
ENV="production"
BUILD_DIR="dist"
VERSION=$(node -p "require('./package.json').version")

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --env=*)
      ENV="${1#*=}"
      shift
      ;;
    --build-dir=*)
      BUILD_DIR="${1#*=}"
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "🏗️  Building SmileSync v$VERSION for $ENV environment"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# Build frontend
echo "📱 Building frontend..."
./scripts/build/build-frontend.sh --env=$ENV --output=$BUILD_DIR/frontend

# Build backend
echo "🔧 Building backend..."
./scripts/build/build-backend.sh --env=$ENV --output=$BUILD_DIR/backend

# Build Electron app
echo "🖥️  Building Electron app..."
./scripts/build/build-electron.sh --env=$ENV --output=$BUILD_DIR/electron

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf "$BUILD_DIR/smilesync-v$VERSION-$ENV.tar.gz" -C $BUILD_DIR .

echo "✅ Build complete! Package: $BUILD_DIR/smilesync-v$VERSION-$ENV.tar.gz"
```

### Frontend Build
```bash
# Build React frontend
./scripts/build/build-frontend.sh

# Build with custom output directory
./scripts/build/build-frontend.sh --output=custom/path
```

### Backend Build
```bash
# Build Express backend
./scripts/build/build-backend.sh

# Build with minification
./scripts/build/build-backend.sh --minify
```

### Electron Build
```bash
# Build Electron desktop app
./scripts/build/build-electron.sh

# Build for specific platforms
./scripts/build/build-electron.sh --platform=darwin,win32,linux
```

## 🗄️ Database Scripts

### Database Migration
```bash
# Run all pending migrations
./scripts/database/migrate.sh

# Run specific migration
./scripts/database/migrate.sh --file=20240315_add_patient_notes.js

# Rollback last migration
./scripts/database/migrate.sh --rollback
```

**migrate.sh** - Database migration management:
```bash
#!/bin/bash
# SmileSync Database Migration Script

set -e

cd backend

# Parse arguments
FILE=""
ROLLBACK=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --file=*)
      FILE="${1#*=}"
      shift
      ;;
    --rollback)
      ROLLBACK=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

if [ "$ROLLBACK" = true ]; then
    echo "⏪ Rolling back last migration..."
    npx sequelize-cli db:migrate:undo
elif [ -n "$FILE" ]; then
    echo "🔄 Running specific migration: $FILE"
    npx sequelize-cli db:migrate --to $FILE
else
    echo "🔄 Running all pending migrations..."
    npx sequelize-cli db:migrate
fi

echo "✅ Migration complete!"
```

### Database Seeding
```bash
# Seed development data
./scripts/database/seed.sh

# Seed production data
./scripts/database/seed.sh --env=production

# Seed specific seeder
./scripts/database/seed.sh --file=demo-patients.js
```

### Database Backup
```bash
# Create database backup
./scripts/database/backup.sh

# Create backup with custom name
./scripts/database/backup.sh --name=pre-migration-backup

# Create compressed backup
./scripts/database/backup.sh --compress
```

### Database Restore
```bash
# Restore from latest backup
./scripts/database/restore.sh

# Restore from specific backup
./scripts/database/restore.sh --file=backup-20240315.sql
```

## 🧪 Testing Scripts

### Run Test Suite
```bash
# Run all tests
./scripts/test/run-tests.sh

# Run specific test type
./scripts/test/run-tests.sh --type=unit
./scripts/test/run-tests.sh --type=integration
./scripts/test/run-tests.sh --type=e2e

# Run tests with coverage
./scripts/test/run-tests.sh --coverage
```

**run-tests.sh** - Comprehensive test execution:
```bash
#!/bin/bash
# SmileSync Test Runner

set -e

# Configuration
TEST_TYPE="all"
COVERAGE=false
WATCH=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --type=*)
      TEST_TYPE="${1#*=}"
      shift
      ;;
    --coverage)
      COVERAGE=true
      shift
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "🧪 Running SmileSync tests (type: $TEST_TYPE)"

cd tests

# Build test command
TEST_CMD="npm test"

if [ "$COVERAGE" = true ]; then
    TEST_CMD="npm run test:coverage"
fi

if [ "$WATCH" = true ]; then
    TEST_CMD="$TEST_CMD -- --watch"
fi

if [ "$VERBOSE" = true ]; then
    TEST_CMD="$TEST_CMD -- --verbose"
fi

# Run specific test types
case $TEST_TYPE in
    unit)
        echo "🔬 Running unit tests..."
        npm run test:frontend
        npm run test:backend
        ;;
    integration)
        echo "🔗 Running integration tests..."
        npm run test:integration
        ;;
    e2e)
        echo "🎭 Running end-to-end tests..."
        npm run test:e2e
        ;;
    all)
        echo "🎯 Running all tests..."
        eval $TEST_CMD
        ;;
    *)
        echo "❌ Unknown test type: $TEST_TYPE"
        echo "Available types: unit, integration, e2e, all"
        exit 1
        ;;
esac

echo "✅ Tests completed successfully!"
```

### Coverage Report
```bash
# Generate coverage report
./scripts/test/coverage.sh

# Generate and open HTML report
./scripts/test/coverage.sh --open

# Generate coverage for specific component
./scripts/test/coverage.sh --component=frontend
```

### End-to-End Tests
```bash
# Run E2E tests
./scripts/test/e2e.sh

# Run E2E tests in headed mode
./scripts/test/e2e.sh --headed

# Run specific E2E test
./scripts/test/e2e.sh --spec=patient-management
```

## 🚀 Deployment Scripts

### Production Deployment
```bash
# Deploy to production
./scripts/deploy/deploy-prod.sh

# Deploy specific version
./scripts/deploy/deploy-prod.sh --version=1.2.3

# Deploy with rollback capability
./scripts/deploy/deploy-prod.sh --enable-rollback
```

**deploy-prod.sh** - Production deployment automation:
```bash
#!/bin/bash
# SmileSync Production Deployment

set -e

# Configuration
VERSION="latest"
ENABLE_ROLLBACK=false
DEPLOY_DIR="/opt/smilesync"
BACKUP_DIR="/opt/smilesync/backups"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --version=*)
      VERSION="${1#*=}"
      shift
      ;;
    --enable-rollback)
      ENABLE_ROLLBACK=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "🚀 Deploying SmileSync v$VERSION to production"

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
./scripts/deploy/health-check.sh --pre-deploy

# Create backup if rollback is enabled
if [ "$ENABLE_ROLLBACK" = true ]; then
    echo "💾 Creating backup for rollback..."
    ./scripts/utils/backup-all.sh --name="pre-deploy-v$VERSION"
fi

# Stop services
echo "🛑 Stopping services..."
sudo systemctl stop smilesync-backend
sudo systemctl stop smilesync-frontend

# Deploy new version
echo "📦 Deploying new version..."
tar -xzf "dist/smilesync-v$VERSION-production.tar.gz" -C $DEPLOY_DIR

# Run database migrations
echo "🗄️  Running database migrations..."
cd $DEPLOY_DIR/backend
npm run db:migrate

# Start services
echo "▶️  Starting services..."
sudo systemctl start smilesync-backend
sudo systemctl start smilesync-frontend

# Post-deployment checks
echo "✅ Running post-deployment checks..."
./scripts/deploy/health-check.sh --post-deploy

echo "🎉 Deployment completed successfully!"
```

### Staging Deployment
```bash
# Deploy to staging
./scripts/deploy/deploy-staging.sh

# Deploy and run smoke tests
./scripts/deploy/deploy-staging.sh --run-tests
```

### Health Check
```bash
# Run health checks
./scripts/deploy/health-check.sh

# Pre-deployment checks
./scripts/deploy/health-check.sh --pre-deploy

# Post-deployment checks
./scripts/deploy/health-check.sh --post-deploy
```

## 🛠️ Utility Scripts

### System Cleanup
```bash
# Clean temporary files
./scripts/utils/cleanup.sh

# Deep clean (including node_modules)
./scripts/utils/cleanup.sh --deep

# Clean specific directories
./scripts/utils/cleanup.sh --dirs="dist,coverage,logs"
```

**cleanup.sh** - System maintenance and cleanup:
```bash
#!/bin/bash
# SmileSync Cleanup Script

set -e

# Configuration
DEEP_CLEAN=false
CUSTOM_DIRS=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --deep)
      DEEP_CLEAN=true
      shift
      ;;
    --dirs=*)
      CUSTOM_DIRS="${1#*=}"
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "🧹 Cleaning SmileSync project..."

# Standard cleanup
echo "📁 Removing build artifacts..."
rm -rf dist/
rm -rf build/
rm -rf app/build/
rm -rf backend/dist/
rm -rf electron/dist/

echo "📊 Removing coverage reports..."
rm -rf coverage/
rm -rf tests/coverage/

echo "📝 Removing log files..."
rm -rf logs/
rm -rf *.log
rm -rf app/*.log
rm -rf backend/*.log

echo "🗑️  Removing temporary files..."
rm -rf tmp/
rm -rf .tmp/
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true

# Deep clean
if [ "$DEEP_CLEAN" = true ]; then
    echo "🔥 Deep cleaning (removing node_modules)..."
    rm -rf node_modules/
    rm -rf app/node_modules/
    rm -rf backend/node_modules/
    rm -rf tests/node_modules/
    rm -rf electron/node_modules/
    
    echo "🔒 Removing lock files..."
    rm -f package-lock.json
    rm -f app/package-lock.json
    rm -f backend/package-lock.json
    rm -f tests/package-lock.json
    rm -f electron/package-lock.json
fi

# Custom directories
if [ -n "$CUSTOM_DIRS" ]; then
    echo "📂 Removing custom directories: $CUSTOM_DIRS"
    IFS=',' read -ra DIRS <<< "$CUSTOM_DIRS"
    for dir in "${DIRS[@]}"; do
        rm -rf "$dir"
        echo "   ✅ Removed $dir"
    done
fi

echo "✨ Cleanup completed!"
```

### System Monitoring
```bash
# Monitor system health
./scripts/utils/monitor.sh

# Monitor with alerts
./scripts/utils/monitor.sh --alerts

# Monitor specific services
./scripts/utils/monitor.sh --services="backend,frontend"
```

### Complete Backup
```bash
# Create complete system backup
./scripts/utils/backup-all.sh

# Create backup with custom name
./scripts/utils/backup-all.sh --name=weekly-backup

# Create compressed backup
./scripts/utils/backup-all.sh --compress
```

## 📋 Script Usage Examples

### Daily Development Workflow
```bash
# Start your day
./scripts/dev/setup-env.sh          # Setup environment (first time)
./scripts/dev/start-dev.sh          # Start development servers

# During development
./scripts/test/run-tests.sh --watch  # Run tests in watch mode
./scripts/database/seed.sh           # Refresh test data

# Before committing
./scripts/test/run-tests.sh          # Run full test suite
./scripts/test/coverage.sh           # Check coverage
```

### Release Workflow
```bash
# Prepare release
./scripts/test/run-tests.sh          # Ensure all tests pass
./scripts/build/build-all.sh         # Build production version
./scripts/deploy/deploy-staging.sh   # Deploy to staging

# Production release
./scripts/deploy/health-check.sh --pre-deploy
./scripts/deploy/deploy-prod.sh --enable-rollback
./scripts/deploy/health-check.sh --post-deploy
```

### Maintenance Workflow
```bash
# Weekly maintenance
./scripts/utils/backup-all.sh        # Create backup
./scripts/utils/cleanup.sh           # Clean temporary files
./scripts/utils/monitor.sh           # Check system health

# Database maintenance
./scripts/database/backup.sh         # Backup database
./scripts/database/migrate.sh        # Apply new migrations
```

## 🔧 Configuration

### Environment Variables
```bash
# Development
export NODE_ENV=development
export SMILESYNC_DB_PATH=./dev.db
export SMILESYNC_LOG_LEVEL=debug

# Production
export NODE_ENV=production
export SMILESYNC_DB_PATH=/opt/smilesync/data/prod.db
export SMILESYNC_LOG_LEVEL=info
```

### Script Configuration
```bash
# scripts/config/default.conf
BUILD_DIR="dist"
DEPLOY_DIR="/opt/smilesync"
BACKUP_DIR="/opt/smilesync/backups"
LOG_DIR="/var/log/smilesync"

# Database
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="smilesync"

# Services
FRONTEND_PORT="3000"
BACKEND_PORT="3001"
ELECTRON_PORT="3002"
```

## 🚨 Error Handling

### Common Issues and Solutions

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use the cleanup script
./scripts/utils/cleanup.sh --deep
```

#### Database Connection Issues
```bash
# Reset database
./scripts/dev/reset-db.sh

# Check database status
./scripts/database/health-check.sh
```

#### Build Failures
```bash
# Clean and rebuild
./scripts/utils/cleanup.sh --deep
./scripts/dev/setup-env.sh
./scripts/build/build-all.sh
```

## 📊 Performance Monitoring

### Script Performance
```bash
# Time script execution
time ./scripts/build/build-all.sh

# Profile script
bash -x ./scripts/deploy/deploy-prod.sh

# Monitor resource usage
./scripts/utils/monitor.sh --performance
```

## 🔮 Future Enhancements

- **Docker Integration**: Containerized deployment scripts
- **Kubernetes Support**: K8s deployment automation
- **CI/CD Integration**: GitHub Actions workflow scripts
- **Monitoring Integration**: Prometheus/Grafana setup
- **Security Scanning**: Automated vulnerability checks
- **Performance Testing**: Load testing automation
- **Multi-environment**: Enhanced environment management

---

**Scripts Documentation** - Automation and workflow management for SmileSync. 🛠️⚡