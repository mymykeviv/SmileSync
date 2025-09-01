import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Alert,
  Snackbar,
  Box,
  Typography,
  Button,
  Chip
} from '@mui/material';
import {
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Network Status Context
const NetworkContext = createContext();

/**
 * Hook to access network status
 */
export const useNetworkStatus = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within a NetworkProvider');
  }
  return context;
};

/**
 * Network Status Provider Component
 */
export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [lastOnlineTime, setLastOnlineTime] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
      setReconnectAttempts(0);
      console.log('Network connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
      setLastOnlineTime(new Date());
      console.log('Network connection lost');
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check
    const connectivityCheck = setInterval(async () => {
      try {
        // Try to fetch a small resource to verify actual connectivity
        const response = await fetch('http://localhost:5001/health', {
          method: 'HEAD',
          cache: 'no-cache',
          timeout: 5000
        });
        
        if (response.ok && !isOnline) {
          handleOnline();
        }
      } catch (error) {
        if (isOnline) {
          handleOffline();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectivityCheck);
    };
  }, [isOnline]);

  const attemptReconnect = async () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('Maximum reconnection attempts reached');
      return false;
    }

    setReconnectAttempts(prev => prev + 1);
    
    try {
      const response = await fetch('http://localhost:5001/health', {
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 10000
      });
      
      if (response.ok) {
        setIsOnline(true);
        setShowOfflineAlert(false);
        setReconnectAttempts(0);
        return true;
      }
    } catch (error) {
      console.log(`Reconnection attempt ${reconnectAttempts + 1} failed:`, error);
    }
    
    return false;
  };

  const value = {
    isOnline,
    lastOnlineTime,
    reconnectAttempts,
    maxReconnectAttempts,
    attemptReconnect
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
      <NetworkStatusIndicator 
        isOnline={isOnline}
        showOfflineAlert={showOfflineAlert}
        onRetry={attemptReconnect}
        reconnectAttempts={reconnectAttempts}
        maxReconnectAttempts={maxReconnectAttempts}
      />
    </NetworkContext.Provider>
  );
};

/**
 * Network Status Indicator Component
 */
const NetworkStatusIndicator = ({ 
  isOnline, 
  showOfflineAlert, 
  onRetry, 
  reconnectAttempts, 
  maxReconnectAttempts 
}) => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <>
      {/* Offline Alert Snackbar */}
      <Snackbar
        open={showOfflineAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert 
          severity="warning" 
          sx={{ width: '100%', alignItems: 'center' }}
          icon={<OfflineIcon />}
          action={
            reconnectAttempts < maxReconnectAttempts && (
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRetry}
                disabled={retrying}
                startIcon={<RefreshIcon />}
              >
                {retrying ? 'Retrying...' : 'Retry'}
              </Button>
            )
          }
        >
          <Box>
            <Typography variant="body2" fontWeight="medium">
              No internet connection
            </Typography>
            <Typography variant="caption">
              Some features may not be available. Changes will be saved locally.
              {reconnectAttempts > 0 && (
                <> Attempt {reconnectAttempts}/{maxReconnectAttempts}</>
              )}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      {/* Connection Status Chip (for development/debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 9999
          }}
        >
          <Chip
            icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
            label={isOnline ? 'Online' : 'Offline'}
            color={isOnline ? 'success' : 'error'}
            variant="filled"
            size="small"
          />
        </Box>
      )}
    </>
  );
};

export default NetworkProvider;