# SmileSync - Offline Windows Deployment Package

This package contains everything needed to deploy SmileSync on a Windows laptop without internet connectivity.

## Package Contents

```
windows-offline/
├── README.md                    # This file
├── install.bat                  # Main installation script
├── setup/
│   ├── node-v18.19.0-x64.msi   # Node.js installer
│   ├── git-installer.exe        # Git for Windows (optional)
│   └── sqlite-tools.zip         # SQLite command-line tools
├── dependencies/
│   ├── node_modules.tar.gz      # Pre-downloaded dependencies
│   ├── app-dependencies.tar.gz  # Frontend dependencies
│   └── backend-dependencies.tar.gz # Backend dependencies
├── application/
│   ├── SmileSync-source.zip     # Complete source code
│   └── SmileSync-built.zip      # Pre-built application
├── database/
│   ├── schema.sql               # Database schema
│   ├── seed-data.sql            # Initial data
│   └── smilesync-template.db    # Pre-configured database
└── scripts/
    ├── start-application.bat    # Start the application
    ├── stop-application.bat     # Stop the application
    ├── backup-database.bat      # Backup database
    └── restore-database.bat     # Restore database
```

## System Requirements

- **Operating System**: Windows 10 or Windows 11
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: 2GB free space
- **Processor**: Intel/AMD x64 compatible
- **Network**: Not required for operation (offline deployment)

## Installation Instructions

### Step 1: Extract the Package

1. Extract the `SmileSync-Windows-Offline.zip` to a folder (e.g., `C:\SmileSync`)
2. Open Command Prompt as Administrator
3. Navigate to the extracted folder:
   ```cmd
   cd C:\SmileSync\windows-offline
   ```

### Step 2: Run the Installer

```cmd
install.bat
```

The installer will:
- Check system requirements
- Install Node.js (if not present)
- Extract application files
- Install dependencies from local cache
- Set up the database
- Create desktop shortcuts
- Configure Windows services (optional)

### Step 3: Start the Application

After installation, you can start SmileSync using:

**Option A: Desktop Shortcut**
- Double-click "SmileSync" on your desktop

**Option B: Command Line**
```cmd
cd C:\SmileSync
scripts\start-application.bat
```

**Option C: Windows Service** (if configured)
- The application will start automatically with Windows

## Default Login Credentials

### Administrator Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator (full access)

### Dentist Account
- **Username**: `drsmith`
- **Password**: `dentist123`
- **Role**: Dentist (clinical access)

### Staff Account
- **Username**: `staff`
- **Password**: `staff123`
- **Role**: Receptionist (front desk access)

## Application URLs

Once started, access SmileSync at:
- **Web Interface**: http://localhost:3000
- **API Endpoint**: http://localhost:5001
- **Database**: SQLite file at `C:\SmileSync\data\smilesync.db`

## Troubleshooting

### Installation Issues

**Problem**: "Node.js installation failed"
**Solution**: 
1. Run Command Prompt as Administrator
2. Manually install Node.js from `setup/node-v18.19.0-x64.msi`
3. Restart the installation

**Problem**: "Port already in use"
**Solution**:
1. Check if another application is using ports 3000 or 5001
2. Stop other applications or modify port configuration
3. Restart SmileSync

**Problem**: "Database connection failed"
**Solution**:
1. Ensure SQLite is properly installed
2. Check database file permissions
3. Run `scripts\restore-database.bat` to reset database

### Runtime Issues

**Problem**: "Application won't start"
**Solution**:
1. Check Windows Event Viewer for errors
2. Verify Node.js is in system PATH
3. Run `scripts\start-application.bat` from Command Prompt to see error messages

**Problem**: "Login not working"
**Solution**:
1. Use default credentials listed above
2. Check if database was properly initialized
3. Reset database using `scripts\restore-database.bat`

## Maintenance

### Database Backup
```cmd
scripts\backup-database.bat
```
Creates a backup in `C:\SmileSync\backups\`

### Database Restore
```cmd
scripts\restore-database.bat
```
Restores from the most recent backup

### Application Updates
1. Stop the application
2. Replace application files
3. Run database migration if needed
4. Restart the application

### Log Files
- **Application Logs**: `C:\SmileSync\logs\`
- **Error Logs**: `C:\SmileSync\logs\error.log`
- **Access Logs**: `C:\SmileSync\logs\access.log`

## Security Considerations

### Network Security
- Application runs on localhost only by default
- No external network access required
- Database is file-based (SQLite)

### Data Security
- Change default passwords immediately after installation
- Regular database backups recommended
- Restrict file system access to authorized users

### User Management
- Create individual user accounts for each staff member
- Assign appropriate roles based on job functions
- Regularly review user access permissions

## Support

For technical support:
1. Check the troubleshooting section above
2. Review log files for error messages
3. Contact your system administrator
4. Refer to the main documentation in the `docs/` folder

## Uninstallation

To remove SmileSync:
1. Stop the application
2. Remove Windows service (if configured)
3. Delete the installation folder
4. Remove desktop shortcuts
5. Uninstall Node.js (if no longer needed)

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Package Type**: Offline Windows Deployment