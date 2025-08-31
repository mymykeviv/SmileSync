# SmileSync Local Deployment Guide

This guide will help you set up and run the SmileSync dental practice management application locally on your machine.

## Quick Start (TL;DR)

For experienced developers who want to get started immediately:

### Using Cross-Platform Scripts (Recommended)

**Windows:**
```cmd
# 1. Clone and install dependencies
git clone <repository-url>
cd SmileSync
npm run install:all

# 2. Set up database
cd backend
npm run db:migrate
npm run db:seed
cd ..

# 3. Start development environment
scripts\start-dev.bat
```

**Mac/Linux:**
```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd SmileSync
npm run install:all

# 2. Set up database
cd backend
npm run db:migrate
npm run db:seed
cd ..

# 3. Start development environment
./scripts/start-dev.sh
```

**Desktop App Mode:**
```bash
# For desktop application (Electron)
npm run electron:dev
# Login: admin@smilesync.com / admin123
```

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Python 3.8+** (for backend services)
- **Git** (for version control)
- **SQLite** (database is included with the backend)

## Project Structure

The SmileSync application consists of three main components:

```
SmileSync/
├── app/          # React frontend application
├── backend/      # Node.js/Express backend API
├── electron/     # Electron desktop wrapper (optional)
└── docs/         # Documentation
```

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SmileSync
```

### 2. Install Dependencies

#### Frontend (React App)
```bash
cd app
npm install
cd ..
```

#### Backend (Node.js API)
```bash
cd backend
npm install
cd ..
```

#### Root Dependencies (for Electron)
```bash
npm install
```

### 3. Database Setup

The application uses SQLite as the database, which requires no additional installation. The database file will be automatically created when you first run the backend.

**No additional database setup required!** SQLite is file-based and will be created automatically.

### 4. Environment Variables

Create environment configuration files:

#### Backend Environment (.env in backend folder)
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
DB_PATH=./database/smilesync.db
DB_LOGGING=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

#### Frontend Environment (.env in app folder)
```bash
cd app
cp .env.example .env
```

Edit the `.env` file:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001

# App Configuration
REACT_APP_NAME=SmileSync
REACT_APP_VERSION=1.0.0

# Development
PORT=3002
BROWSER=none
```

### 5. Database Initialization

Run database migrations and seed data:

```bash
cd backend
npm run db:migrate
npm run db:seed
```

This will:
- Create the SQLite database file
- Set up all necessary tables
- Insert sample data for testing

## Running the Application

### Development Mode

You'll need to run both the backend and frontend simultaneously. Open **three separate terminals**:

#### Option A: Individual Components

**Terminal 1: Backend API**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5001`

**Terminal 2: Frontend React App**
```bash
cd app
npm start
```
The frontend will run on `http://localhost:3002`

**Terminal 3: Electron Desktop App (Optional)**
```bash
# From the root directory
npm run electron:dev
```

#### Option B: Cross-Platform Scripts (Recommended)

**Windows (.bat scripts):**
```cmd
# Start development environment
scripts\start-dev.bat

# Start production application
scripts\start-prod.bat

# Stop development environment
scripts\stop-dev.bat

# Stop production application
scripts\stop-prod.bat

# Build for distribution
scripts\build-electron.bat
```

**Mac/Linux (.sh scripts):**
```bash
# Start development environment
./scripts/start-dev.sh

# Start production application
./scripts/start-prod.sh

# Stop development environment
./scripts/stop-dev.sh

# Stop production application
./scripts/stop-prod.sh

# Build for distribution
./scripts/build-electron.sh
```

#### Option C: NPM Scripts (All Platforms)

**Single Command to Start Everything:**
```bash
# From the root directory
npm run start:dev
```
This will start both backend and frontend simultaneously.

### Production Mode

#### Build the Frontend
```bash
cd app
npm run build
```

#### Start Production Backend
```bash
cd backend
npm run start:prod
```

#### Build Electron App
```bash
# From root directory
npm run electron:build
```

## Accessing the Application

### Web Browser Mode
- **Web Application**: http://localhost:3002
- **API Documentation**: http://localhost:5001/api/docs
- **API Health Check**: http://localhost:5001/api/health

### Desktop Application Mode (Electron)

SmileSync can run as a native desktop application using Electron:

#### Development Mode
```bash
# Start desktop app in development mode
npm run electron:dev
```
This will:
- Start the backend server
- Start the React development server
- Launch the Electron desktop application
- Enable hot reloading for development

#### Production Mode
```bash
# Build and run desktop app in production mode
npm run electron:prod
```

#### Building for Distribution

**Windows:**
```cmd
scripts\build-electron.bat
```

**Mac/Linux:**
```bash
./scripts/build-electron.sh
```

**Or using npm:**
```bash
npm run electron:dist
```

This will create distributable packages in the `dist/` folder:
- **Windows**: `.exe` installer and portable app
- **macOS**: `.dmg` installer and `.app` bundle
- **Linux**: `.AppImage`, `.deb`, and `.rpm` packages

#### Desktop App Features
- Native desktop integration
- System tray support
- Offline capability (with local SQLite database)
- Auto-updater support (configurable)
- Native file system access for exports/imports
- Better performance than web version

## Default Login Credentials

After running the seed script, you can log in with:

- **Email**: admin@smilesync.com
- **Password**: admin123

⚠️ **Important**: Change these credentials immediately after first login!

## Common Issues and Troubleshooting

### Port Conflicts
If ports 3002 or 5001 are already in use:

```bash
# Check what's using the port
lsof -i :3002
lsof -i :5001

# Kill the process if needed
kill -9 <PID>
```

### Database Connection Issues
1. Ensure MongoDB is running
2. Check your connection string in `.env`
3. Verify database permissions

### Module Not Found Errors
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues
Ensure your frontend URL is added to the backend CORS configuration in `backend/src/config/cors.js`

## Development Tools

### Useful Commands

#### Cross-Platform Scripts

**Windows:**
```cmd
scripts\start-dev.bat      # Start development environment
scripts\start-prod.bat     # Start production application
scripts\stop-dev.bat       # Stop development environment
scripts\stop-prod.bat      # Stop production application
scripts\build-electron.bat # Build for distribution
```

**Mac/Linux:**
```bash
./scripts/start-dev.sh      # Start development environment
./scripts/start-prod.sh     # Start production application
./scripts/stop-dev.sh       # Stop development environment
./scripts/stop-prod.sh      # Stop production application
./scripts/build-electron.sh # Build for distribution
```

#### Individual Component Commands

```bash
# Backend
cd backend
npm run dev          # Start with nodemon
npm run test         # Run tests
npm run lint         # Check code style
npm run db:reset     # Reset database

# Frontend
cd app
npm start            # Development server
npm run build        # Production build
npm run test         # Run tests
npm run analyze      # Bundle analyzer

# Root (Electron)
npm run electron:dev    # Development mode
npm run electron:build  # Build for distribution
```

### Database Management

```bash
# View database file location
ls backend/database/

# Reset database (WARNING: This will delete all data)
cd backend
npm run db:reset

# Re-seed with sample data
npm run db:seed

# For direct SQLite access (if sqlite3 CLI is installed)
sqlite3 backend/database/smilesync.db
# Then use SQL commands like:
# .tables
# SELECT * FROM users;
# .quit
```

## Performance Optimization

### Frontend
- Enable React DevTools for debugging
- Use Chrome DevTools for performance profiling
- Monitor bundle size with `npm run analyze`

### Backend
- Monitor API response times
- Use MongoDB Compass for database optimization
- Enable logging for debugging

## Security Considerations

1. **Change default credentials** immediately
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** for production deployment
4. **Regularly update dependencies**
5. **Implement proper backup strategies**

## Backup and Data Management

### Database Backup
```bash
# Create backup (SQLite is just a file)
cp backend/database/smilesync.db ./backup/smilesync-backup-$(date +%Y%m%d).db

# Restore backup
cp ./backup/smilesync-backup-20240101.db backend/database/smilesync.db
```

### File Uploads Backup
```bash
# Backup uploaded files
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz backend/uploads/
```

## Support and Documentation

- **API Documentation**: Available at `/api/docs` when backend is running
- **Component Documentation**: Run `npm run storybook` in the app directory
- **Database Schema**: See `backend/src/models/` directory

## Next Steps

After successful local deployment:

1. Explore the application features
2. Review the codebase structure
3. Set up your development environment
4. Consider production deployment options

For production deployment, consider using:
- **Docker** for containerization
- **PM2** for process management
- **Nginx** for reverse proxy
- **SSL certificates** for HTTPS

---

**Need Help?** Check the troubleshooting section above or refer to the individual component README files in their respective directories.