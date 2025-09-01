import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getErrorMessage, getAppointmentConflictMessage } from '../../utils/errorMapping';

/**
 * Enhanced Error Display Component
 * Shows user-friendly error messages with retry functionality
 */
const ErrorDisplay = ({
  error,
  onRetry,
  onClose,
  showDetails = false,
  variant = 'standard', // 'standard', 'inline', 'toast'
  severity = 'error'
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [retrying, setRetrying] = useState(false);

  if (!error) return null;

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    
    setRetrying(true);
    try {
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setRetrying(false);
    }
  };

  const getErrorDetails = () => {
    if (typeof error === 'string') {
      return {
        message: error,
        canRetry: false,
        isNetworkError: false
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
      canRetry: error.canRetry || error.isNetworkError || false,
      isNetworkError: error.isNetworkError || false,
      statusCode: error.statusCode,
      originalError: error.originalError,
      endpoint: error.endpoint,
      retryDelay: error.retryDelay
    };
  };

  const errorDetails = getErrorDetails();
  const showRetryButton = onRetry && (errorDetails.canRetry || errorDetails.isNetworkError);

  // Handle appointment conflict errors with special formatting
  const isAppointmentConflict = errorDetails.originalError?.code === 'APPOINTMENT_CONFLICT';
  const conflictDetails = isAppointmentConflict ? errorDetails.originalError?.details : null;

  const renderErrorContent = () => (
    <>
      <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorIcon fontSize="small" />
        {isAppointmentConflict ? 'Appointment Conflict' : 'Error'}
      </AlertTitle>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        {isAppointmentConflict 
          ? getAppointmentConflictMessage(conflictDetails)
          : errorDetails.message
        }
      </Typography>

      {conflictDetails?.conflictingAppointment && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Conflicting Appointment:
          </Typography>
          <Typography variant="body2">
            {(() => {
              const { appointmentDate, appointmentTime, duration } = conflictDetails.conflictingAppointment;
              // Handle timestamp (number) or date string
              const date = typeof appointmentDate === 'number' 
                ? new Date(appointmentDate)
                : new Date(appointmentDate);
              
              const formattedDate = date.toLocaleDateString();
              const formattedTime = appointmentTime || 'Time not specified';
              const durationText = duration ? ` (${duration} minutes)` : '';
              
              return `${formattedDate} at ${formattedTime}${durationText}`;
            })()}
          </Typography>
        </Box>
      )}

      {errorDetails.isNetworkError && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            This appears to be a network connectivity issue. Please check your internet connection.
          </Typography>
        </Alert>
      )}

      <Stack direction="row" spacing={1} alignItems="center">
        {showRetryButton && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            disabled={retrying}
            color={errorDetails.isNetworkError ? 'info' : 'primary'}
          >
            {retrying ? 'Retrying...' : 'Try Again'}
          </Button>
        )}
        
        {showDetails && errorDetails.originalError && (
          <Button
            variant="text"
            size="small"
            startIcon={showTechnicalDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            color="inherit"
          >
            {showTechnicalDetails ? 'Hide' : 'Show'} Details
          </Button>
        )}
        
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ ml: 'auto' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Collapse in={showTechnicalDetails}>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Technical Details:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', mt: 1 }}>
            {JSON.stringify({
              endpoint: errorDetails.endpoint,
              statusCode: errorDetails.statusCode,
              originalError: errorDetails.originalError
            }, null, 2)}
          </Typography>
        </Box>
      </Collapse>
    </>
  );

  // Render based on variant
  switch (variant) {
    case 'inline':
      return (
        <Box sx={{ mb: 2 }}>
          <Alert severity={severity} onClose={onClose}>
            {renderErrorContent()}
          </Alert>
        </Box>
      );
    
    case 'toast':
      return (
        <Alert 
          severity={severity} 
          onClose={onClose}
          sx={{ 
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 9999,
            minWidth: 300,
            maxWidth: 500
          }}
        >
          {renderErrorContent()}
        </Alert>
      );
    
    default:
      return (
        <Alert severity={severity} sx={{ mb: 2 }}>
          {renderErrorContent()}
        </Alert>
      );
  }
};

/**
 * Hook for managing error state with automatic retry functionality
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleError = (err) => {
    console.error('Error handled:', err);
    setError(err);
  };

  const clearError = () => {
    setError(null);
    setRetryCount(0);
  };

  const retry = async (retryFunction) => {
    if (retryCount >= maxRetries) {
      handleError(new Error('Maximum retry attempts reached. Please try again later.'));
      return;
    }

    try {
      setRetryCount(prev => prev + 1);
      
      // Add delay for network errors
      if (error?.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, error.retryDelay));
      }
      
      await retryFunction();
      clearError();
    } catch (retryError) {
      handleError(retryError);
    }
  };

  return {
    error,
    handleError,
    clearError,
    retry,
    retryCount,
    canRetry: retryCount < maxRetries
  };
};

export default ErrorDisplay;