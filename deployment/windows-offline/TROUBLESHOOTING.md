# SmileSync Troubleshooting Guide

This guide helps resolve common issues with SmileSync offline deployment on Windows.

## Quick Diagnostics

Before troubleshooting specific issues, run the system check:

```batch
C:\SmileSync\scripts\system-check.bat
```

This will identify most common problems automatically.

## Common Issues and Solutions

### 1. Installation Issues

#### Error: "Node.js installation failed"
**Symptoms:**
- Installation stops with Node.js error
- "Node.js not found" message

**Solutions:**
1. **Run as Administrator**: Right-click `install.bat` and select "Run as administrator"
2. **Manual Node.js Installation**:
   - Go to the `setup` folder in the deployment package
   - Double-click `node-v18.19.0-x64.msi`
   - Follow the installation wizard
   - Restart the SmileSync installer
3. **Check Windows Version**: Ensure you're running Windows 10 or later
4. **Antivirus Interference**: Temporarily disable antivirus during installation

#### Error: "Failed to extract application files"
**Symptoms:**
- Installation fails during file extraction
- "Access denied" errors

**Solutions:**
1. **Check Disk Space**: Ensure at least 2GB free space on C: drive
2. **Run as Administrator**: Installation requires admin privileges
3. **Antivirus Exclusion**: Add `C:\SmileSync` to antivirus exclusions
4. **Manual Extraction**: Extract `application\SmileSync-source.zip` manually to `C:\SmileSync`

### 2. Startup Issues

#### Error: "Port already in use"
**Symptoms:**
- Application fails to start
- "EADDRINUSE" errors in logs
- Ports 3000 or 5001 are occupied

**Solutions:**
1. **Stop Existing Processes**:
   ```batch
   C:\SmileSync\scripts\stop-application.bat
   ```
2. **Check for Other Applications**:
   - Close any other web development servers
   - Check Task Manager for Node.js processes
3. **Restart Computer**: If processes won't stop
4. **Change Ports** (Advanced):
   - Edit `C:\SmileSync\backend\server.js`
   - Change `PORT` environment variable

#### Error: "Node.js not found"
**Symptoms:**
- "'node' is not recognized" error
- Application won't start

**Solutions:**
1. **Restart Command Prompt**: Close and reopen after Node.js installation
2. **Check PATH Environment**:
   - Open System Properties → Environment Variables
   - Ensure `C:\Program Files\nodejs` is in PATH
3. **Reinstall Node.js**: Run the installer from `setup` folder again

### 3. Database Issues

#### Error: "Database connection failed"
**Symptoms:**
- Backend fails to start
- "SQLITE_CANTOPEN" errors
- Login page shows "Server Error"

**Solutions:**
1. **Check Database File**:
   - Verify `C:\SmileSync\data\smilesync.db` exists
   - Check file permissions (should be writable)
2. **Restore from Template**:
   ```batch
   copy "C:\SmileSync\database\smilesync-template.db" "C:\SmileSync\data\smilesync.db"
   ```
3. **Recreate Database**:
   ```batch
   cd C:\SmileSync\backend
   node scripts\create-admin.js
   ```

#### Error: "Login credentials not working"
**Symptoms:**
- Cannot log in with default credentials
- "Invalid username or password" error

**Default Credentials:**
- **Admin**: username `admin`, password `admin123`
- **Dentist**: username `drsmith`, password `dentist123`
- **Staff**: username `staff`, password `staff123`

**Solutions:**
1. **Check Caps Lock**: Ensure correct case
2. **Reset Database**: Restore from template (see above)
3. **Create New Admin**:
   ```batch
   cd C:\SmileSync\backend
   node scripts\create-admin.js
   ```

### 4. Network and Access Issues

#### Error: "Cannot access http://localhost:3000"
**Symptoms:**
- Browser shows "This site can't be reached"
- Connection timeout errors

**Solutions:**
1. **Check Services Status**:
   ```batch
   netstat -an | find ":3000"
   netstat -an | find ":5001"
   ```
2. **Firewall Configuration**:
   - Windows Defender Firewall → Allow an app
   - Add `C:\Program Files\nodejs\node.exe`
3. **Try Different Browser**: Test with Chrome, Firefox, or Edge
4. **Check Logs**:
   - Frontend: `C:\SmileSync\logs\frontend.log`
   - Backend: `C:\SmileSync\logs\backend.log`

#### Error: "Slow performance or timeouts"
**Symptoms:**
- Pages load slowly
- Frequent timeouts
- Unresponsive interface

**Solutions:**
1. **Check System Resources**:
   - Task Manager → Performance tab
   - Ensure sufficient RAM and CPU available
2. **Close Unnecessary Programs**: Free up system resources
3. **Restart Application**:
   ```batch
   C:\SmileSync\scripts\stop-application.bat
   C:\SmileSync\scripts\start-application.bat
   ```
4. **Check Antivirus**: Real-time scanning may slow performance

### 5. Browser Issues

#### Error: "Browser doesn't open automatically"
**Symptoms:**
- Application starts but browser doesn't open
- Need to manually navigate to localhost

**Solutions:**
1. **Manual Navigation**: Go to `http://localhost:3000` in your browser
2. **Set Default Browser**: Ensure you have a default browser set
3. **Browser Compatibility**: Use modern browsers (Chrome, Firefox, Edge)

#### Error: "White screen or JavaScript errors"
**Symptoms:**
- Blank page in browser
- Console shows JavaScript errors
- Features not working

**Solutions:**
1. **Clear Browser Cache**: Ctrl+F5 to hard refresh
2. **Disable Browser Extensions**: Try incognito/private mode
3. **Check Console**: F12 → Console tab for error details
4. **Update Browser**: Ensure you're using a recent version

## Advanced Troubleshooting

### Log File Analysis

**Log Locations:**
- Installation: `C:\SmileSync\installation.log`
- Backend: `C:\SmileSync\logs\backend.log`
- Frontend: `C:\SmileSync\logs\frontend.log`
- System Check: `C:\SmileSync\logs\system-check_YYYYMMDD.log`

**Common Error Patterns:**
- `ENOENT`: File not found
- `EACCES`: Permission denied
- `EADDRINUSE`: Port already in use
- `SQLITE_`: Database-related errors

### Manual Service Management

**Start Services Manually:**
```batch
REM Start Backend
cd C:\SmileSync\backend
set PORT=5001
node server.js

REM Start Frontend (in new command prompt)
cd C:\SmileSync\app
npm start
```

**Stop Services Manually:**
```batch
REM Find and kill Node.js processes
tasklist | find "node.exe"
taskkill /F /IM node.exe
```

### Database Recovery

**Backup Current Database:**
```batch
copy "C:\SmileSync\data\smilesync.db" "C:\SmileSync\backups\smilesync_backup_%date%.db"
```

**Restore from Backup:**
```batch
copy "C:\SmileSync\backups\smilesync_backup_YYYYMMDD.db" "C:\SmileSync\data\smilesync.db"
```

### Performance Optimization

**System Requirements Check:**
- **RAM**: Minimum 4GB, Recommended 8GB+
- **CPU**: Dual-core 2GHz or better
- **Disk**: 2GB free space minimum
- **OS**: Windows 10 version 1903 or later

**Performance Tips:**
1. Close unnecessary applications
2. Ensure adequate free disk space
3. Add SmileSync to antivirus exclusions
4. Use SSD storage if available
5. Ensure stable network connection

## Getting Help

### Before Contacting Support

1. **Run System Check**: `C:\SmileSync\scripts\system-check.bat`
2. **Collect Logs**: Gather all log files from `C:\SmileSync\logs\`
3. **Document Error Messages**: Take screenshots of any error dialogs
4. **Note System Information**:
   - Windows version
   - Available RAM and disk space
   - Antivirus software
   - Network configuration

### Self-Help Resources

1. **System Check Tool**: Automated diagnostics
2. **Log Files**: Detailed error information
3. **This Guide**: Common solutions
4. **README.md**: Installation instructions

### Emergency Recovery

**Complete Reinstallation:**
1. Run `C:\SmileSync\scripts\backup-data.bat`
2. Uninstall: Delete `C:\SmileSync` folder
3. Run installer again as administrator
4. Restore data from backup if needed

**Quick Reset:**
1. Stop application
2. Delete `C:\SmileSync\data\smilesync.db`
3. Copy template: `copy "C:\SmileSync\database\smilesync-template.db" "C:\SmileSync\data\smilesync.db"`
4. Restart application

## Preventive Maintenance

### Regular Tasks

1. **Weekly Backup**: Run backup script
2. **Log Cleanup**: Remove old log files
3. **System Updates**: Keep Windows updated
4. **Disk Cleanup**: Maintain free space

### Monitoring

1. **Check Disk Space**: Ensure adequate free space
2. **Monitor Performance**: Watch for slowdowns
3. **Review Logs**: Check for recurring errors
4. **Test Backups**: Verify backup integrity

This troubleshooting guide covers the most common issues. For complex problems, use the system check tool and examine log files for specific error messages.