import React from 'react';
import { Box, Typography, Divider, Chip } from '@mui/material';
import { 
  LocalHospital, 
  Security, 
  VerifiedUser,
  Schedule
} from '@mui/icons-material';

const MedicalFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 2,
        px: 3,
        backgroundColor: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
            SmileSync Professional Suite v2.1.0
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
            Comprehensive Dental Practice Management System
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'flex-start', sm: 'center' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security sx={{ fontSize: 16, color: '#6B7280' }} />
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              HIPAA Compliant
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedUser sx={{ fontSize: 16, color: '#6B7280' }} />
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              SOC 2 Certified
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule sx={{ fontSize: 16, color: '#6B7280' }} />
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              24/7 Support
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            icon={<LocalHospital sx={{ fontSize: 14 }} />}
            label="Medical Grade" 
            size="small" 
            variant="outlined"
            sx={{ 
              borderColor: '#2A7FAA',
              color: '#2A7FAA',
              fontSize: '0.7rem',
              '& .MuiChip-icon': {
                color: '#2A7FAA'
              }
            }} 
          />
          <Chip 
            label="Secure" 
            size="small" 
            sx={{ 
              backgroundColor: '#4AA98B',
              color: 'white',
              fontSize: '0.7rem'
            }} 
          />
        </Box>
      </Box>
      
      <Divider sx={{ my: 1.5, borderColor: '#E5E7EB' }} />
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1
        }}
      >
        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
          © 2024 SmileSync Technologies. All rights reserved.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#6B7280',
              cursor: 'pointer',
              '&:hover': { color: '#2A7FAA' }
            }}
          >
            Privacy Policy
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#6B7280',
              cursor: 'pointer',
              '&:hover': { color: '#2A7FAA' }
            }}
          >
            Terms of Service
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#6B7280',
              cursor: 'pointer',
              '&:hover': { color: '#2A7FAA' }
            }}
          >
            Support
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MedicalFooter;