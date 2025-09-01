import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Warning,
  Error,
  LocalHospital,
  Healing,
  MedicalServices,
  MonitorHeart
} from '@mui/icons-material';

const MedicalStatusIndicator = ({ 
  status, 
  type = 'general', 
  size = 'medium',
  showIcon = true,
  showText = true,
  variant = 'chip'
}) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      // General statuses
      active: {
        color: '#10B981',
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
        icon: CheckCircle,
        text: 'Active'
      },
      pending: {
        color: '#F59E0B',
        backgroundColor: '#FFFBEB',
        borderColor: '#FED7AA',
        icon: Schedule,
        text: 'Pending'
      },
      warning: {
        color: '#EF4444',
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        icon: Warning,
        text: 'Warning'
      },
      error: {
        color: '#DC2626',
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        icon: Error,
        text: 'Error'
      },
      
      // Medical-specific statuses
      healthy: {
        color: '#10B981',
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
        icon: MonitorHeart,
        text: 'Healthy'
      },
      treatment: {
        color: '#2A7FAA',
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
        icon: MedicalServices,
        text: 'In Treatment'
      },
      recovery: {
        color: '#4AA98B',
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
        icon: Healing,
        text: 'Recovery'
      },
      critical: {
        color: '#DC2626',
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        icon: LocalHospital,
        text: 'Critical'
      },
      
      // Appointment statuses
      scheduled: {
        color: '#2A7FAA',
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
        icon: Schedule,
        text: 'Scheduled'
      },
      completed: {
        color: '#10B981',
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
        icon: CheckCircle,
        text: 'Completed'
      },
      cancelled: {
        color: '#6B7280',
        backgroundColor: '#F9FAFB',
        borderColor: '#E5E7EB',
        icon: Error,
        text: 'Cancelled'
      },
      
      // Payment statuses
      paid: {
        color: '#10B981',
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
        icon: CheckCircle,
        text: 'Paid'
      },
      overdue: {
        color: '#DC2626',
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        icon: Warning,
        text: 'Overdue'
      },
      partial: {
        color: '#F59E0B',
        backgroundColor: '#FFFBEB',
        borderColor: '#FED7AA',
        icon: Schedule,
        text: 'Partial'
      }
    };
    
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status, type);
  const IconComponent = config.icon;
  
  const sizes = {
    small: { chip: 'small', icon: 14, text: '0.75rem' },
    medium: { chip: 'medium', icon: 16, text: '0.875rem' },
    large: { chip: 'medium', icon: 20, text: '1rem' }
  };
  
  const currentSize = sizes[size];

  if (variant === 'chip') {
    return (
      <Chip
        icon={showIcon ? <IconComponent sx={{ fontSize: currentSize.icon }} /> : undefined}
        label={showText ? config.text : ''}
        size={currentSize.chip}
        sx={{
          backgroundColor: config.backgroundColor,
          color: config.color,
          border: `1px solid ${config.borderColor}`,
          fontWeight: 500,
          fontSize: currentSize.text,
          '& .MuiChip-icon': {
            color: config.color
          }
        }}
      />
    );
  }
  
  if (variant === 'dot') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: currentSize.icon * 0.6,
            height: currentSize.icon * 0.6,
            borderRadius: '50%',
            backgroundColor: config.color,
            border: `2px solid ${config.backgroundColor}`,
          }}
        />
        {showText && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: config.color, 
              fontWeight: 500,
              fontSize: currentSize.text
            }}
          >
            {config.text}
          </Typography>
        )}
      </Box>
    );
  }
  
  // Badge variant
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      {showIcon && (
        <IconComponent 
          sx={{ 
            fontSize: currentSize.icon, 
            color: config.color 
          }} 
        />
      )}
      {showText && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: config.color, 
            fontWeight: 500,
            fontSize: currentSize.text
          }}
        >
          {config.text}
        </Typography>
      )}
    </Box>
  );
};

export default MedicalStatusIndicator;