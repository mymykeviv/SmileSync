# SmileSync - Local Deployment Guide

This guide will help you set up and run SmileSync locally on your development machine.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16.x or higher)
- **npm** (comes with Node.js)
- **SQLite3** (for database)
- **Git** (for version control)

### Checking Prerequisites

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check SQLite3 version
sqlite3 --version

# Check Git version
git --version
```

## Project Structure

```
SmileSync/
├── app/                 # React frontend application
├── backend/             # Node.js backend API
├── DEPLOYMENT.md        # This deployment guide
└── README.md           # Project overview
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SmileSync
```

### 2. Backend Setup

#### Install Backend Dependencies

```bash
cd backend
npm install
```

#### Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env  # If .env.example exists
# OR create manually:
touch .env
```

Add the following environment variables to `.env`:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
DB_PATH=./database/smilesync.db

# JWT Configuration (if using authentication)
JWT_SECRET=your-secret-key-here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

#### Database Setup

The SQLite database will be automatically created when you first run the backend. The database file will be located at `backend/database/smilesync.db`.

#### Start the Backend Server

```bash
# From the backend directory
npm start

# OR for development with auto-reload
npm run dev
```

The backend server will start on `http://localhost:5001`

### 3. Frontend Setup

#### Install Frontend Dependencies

```bash
cd ../app  # Navigate to frontend directory
npm install
```

#### Environment Configuration

Create a `.env` file in the `app` directory:

```bash
touch .env
```

Add the following environment variables:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5001

# Other configurations
REACT_APP_NAME=SmileSync
REACT_APP_VERSION=1.0.0
```

#### Start the Frontend Application

```bash
# From the app directory
npm start
```

The frontend application will start on `http://localhost:3000`

## Running Both Services

### Option 1: Manual Start (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
PORT=5001 npm start
```

**Terminal 2 - Frontend:**
```bash
cd app
npm start
```

### Option 2: Using npm scripts (if configured)

```bash
# From the root directory
npm run dev  # If package.json has dev script configured
```

## Accessing the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **API Documentation:** http://localhost:5001/api-docs (if Swagger is configured)

## Default Login Credentials

If the application has authentication, default credentials might be:
- **Username:** admin
- **Password:** admin123

*Note: Change these credentials immediately in production.*

## Common Issues and Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Find and kill the process using the port
lsof -ti:3000 | xargs kill -9  # For frontend
lsof -ti:5001 | xargs kill -9  # For backend

# OR use different ports
PORT=3001 npm start  # For frontend
PORT=5002 npm start  # For backend
```

### Database Issues

```bash
# Reset the database (WARNING: This will delete all data)
rm backend/database/smilesync.db

# Restart the backend to recreate the database
cd backend
npm start
```

### Node Modules Issues

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

If you encounter CORS errors:
1. Ensure the backend is running on port 5001
2. Check that `CORS_ORIGIN` in backend `.env` matches frontend URL
3. Verify the proxy configuration in `app/package.json`:

```json
{
  "proxy": "http://localhost:5001"
}
```

## Development Workflow

### Making Changes

1. **Backend Changes:** The server will auto-reload if using `npm run dev`
2. **Frontend Changes:** React will auto-reload and show changes immediately
3. **Database Changes:** You may need to restart the backend

### Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd app
npm test
```

### Building for Production

```bash
# Build frontend for production
cd app
npm run build

# The build files will be in app/build/
```

## Database Management

### Accessing the Database

```bash
# Open SQLite CLI
sqlite3 backend/database/smilesync.db

# Common SQLite commands:
.tables          # List all tables
.schema          # Show table schemas
.quit            # Exit SQLite CLI
```

### Backup Database

```bash
# Create a backup
cp backend/database/smilesync.db backend/database/smilesync_backup_$(date +%Y%m%d).db
```

## Performance Optimization

### Development Mode
- Use `npm run dev` for backend (with nodemon)
- React development server automatically optimizes for development

### Production Mode
- Build frontend: `npm run build`
- Use PM2 or similar for backend process management
- Configure reverse proxy (nginx) for production deployment

## Security Considerations

1. **Change default credentials** immediately
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** in production
4. **Validate all inputs** on both frontend and backend
5. **Keep dependencies updated** regularly

## Getting Help

If you encounter issues:

1. Check the console logs in both frontend and backend terminals
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that ports 3000 and 5001 are available
5. Review the troubleshooting section above

## Next Steps

After successful deployment:

1. Explore the application features
2. Set up sample data for testing
3. Configure additional environment-specific settings
4. Set up automated testing
5. Plan for production deployment

---

**Note:** This guide assumes a development environment. For production deployment, additional considerations like security, performance, monitoring, and backup strategies should be implemented.