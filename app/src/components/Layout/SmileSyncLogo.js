import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';

const SmileSyncLogo = ({ variant = 'full', color = 'white', size = 'medium' }) => {
  const logoSizes = {
    small: { icon: 20, text: '1rem' },
    medium: { icon: 28, text: '1.25rem' },
    large: { icon: 36, text: '1.5rem' }
  };

  const currentSize = logoSizes[size];

  if (variant === 'icon') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: currentSize.icon + 8,
          height: currentSize.icon + 8,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: `2px solid ${color === 'white' ? '#FFFFFF' : '#2A7FAA'}`,
        }}
      >
        <LocalHospital 
          sx={{ 
            fontSize: currentSize.icon, 
            color: color === 'white' ? '#FFFFFF' : '#2A7FAA'
          }} 
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: currentSize.icon + 8,
          height: currentSize.icon + 8,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: `2px solid ${color === 'white' ? '#FFFFFF' : '#2A7FAA'}`,
        }}
      >
        <LocalHospital 
          sx={{ 
            fontSize: currentSize.icon, 
            color: color === 'white' ? '#FFFFFF' : '#2A7FAA'
          }} 
        />
      </Box>
      <Box>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: currentSize.text,
            color: color === 'white' ? '#FFFFFF' : '#2A7FAA',
            lineHeight: 1.2,
            letterSpacing: '-0.5px'
          }}
        >
          SmileSync
        </Typography>
        <Typography 
          variant="caption" 
          component="div" 
          sx={{ 
            fontSize: '0.7rem',
            color: color === 'white' ? 'rgba(255, 255, 255, 0.8)' : '#4B5563',
            lineHeight: 1,
            marginTop: '-2px',
            fontWeight: 400
          }}
        >
          Dental Practice
        </Typography>
      </Box>
    </Box>
  );
};

export default SmileSyncLogo;