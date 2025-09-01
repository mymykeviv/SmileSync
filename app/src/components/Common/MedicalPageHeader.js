import React from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MedicalPageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actions = [],
  status,
  showRefresh = false,
  onRefresh,
  icon: IconComponent,
  gradient = false
}) => {
  const navigate = useNavigate();

  const handleBreadcrumbClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: 2,
        backgroundColor: gradient ? 
          'linear-gradient(135deg, #2A7FAA 0%, #4AA98B 100%)' : 
          '#FFFFFF',
        color: gradient ? '#FFFFFF' : '#1F2937',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E7EB',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {gradient && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)'
          }}
        />
      )}
      
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{
              '& .MuiBreadcrumbs-separator': {
                color: gradient ? 'rgba(255, 255, 255, 0.7)' : '#6B7280'
              }
            }}
          >
            <Link
              component="button"
              variant="body2"
              onClick={() => handleBreadcrumbClick('/')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: gradient ? 'rgba(255, 255, 255, 0.8)' : '#6B7280',
                textDecoration: 'none',
                '&:hover': {
                  color: gradient ? '#FFFFFF' : '#2A7FAA',
                  textDecoration: 'underline'
                }
              }}
            >
              <HomeIcon fontSize="small" />
              Dashboard
            </Link>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast ? (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    color: gradient ? '#FFFFFF' : '#1F2937',
                    fontWeight: 500
                  }}
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={index}
                  component="button"
                  variant="body2"
                  onClick={() => handleBreadcrumbClick(crumb.path)}
                  sx={{
                    color: gradient ? 'rgba(255, 255, 255, 0.8)' : '#6B7280',
                    textDecoration: 'none',
                    '&:hover': {
                      color: gradient ? '#FFFFFF' : '#2A7FAA',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>
      )}
      
      {/* Header Content */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
          {IconComponent && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: gradient ? 
                  'rgba(255, 255, 255, 0.2)' : 
                  '#F0F9FF',
                border: gradient ? 
                  '1px solid rgba(255, 255, 255, 0.3)' : 
                  '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconComponent 
                sx={{ 
                  fontSize: 28, 
                  color: gradient ? '#FFFFFF' : '#2A7FAA'
                }} 
              />
            </Box>
          )}
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  color: gradient ? '#FFFFFF' : '#1F2937',
                  lineHeight: 1.2
                }}
              >
                {title}
              </Typography>
              
              {status && (
                <Chip
                  label={status}
                  size="small"
                  sx={{
                    backgroundColor: gradient ? 
                      'rgba(255, 255, 255, 0.2)' : 
                      '#F0FDF4',
                    color: gradient ? '#FFFFFF' : '#166534',
                    border: gradient ? 
                      '1px solid rgba(255, 255, 255, 0.3)' : 
                      '1px solid #BBF7D0',
                    fontWeight: 500
                  }}
                />
              )}
              
              {showRefresh && (
                <IconButton
                  onClick={onRefresh}
                  size="small"
                  sx={{
                    color: gradient ? 'rgba(255, 255, 255, 0.8)' : '#6B7280',
                    '&:hover': {
                      color: gradient ? '#FFFFFF' : '#2A7FAA',
                      backgroundColor: gradient ? 
                        'rgba(255, 255, 255, 0.1)' : 
                        'rgba(42, 127, 170, 0.1)'
                    }
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            
            {subtitle && (
              <Typography 
                variant="body1" 
                sx={{ 
                  color: gradient ? 'rgba(255, 255, 255, 0.9)' : '#6B7280',
                  lineHeight: 1.5
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Actions */}
        {actions.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {actions}
          </Box>
        )}
      </Box>
      
      {/* Medical Context Indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          opacity: 0.6
        }}
      >
        <InfoIcon sx={{ fontSize: 12 }} />
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          Medical Grade System
        </Typography>
      </Box>
    </Box>
  );
};

export default MedicalPageHeader;