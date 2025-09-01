import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
          <Box sx={{ mb: 3 }}>
            <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You don't have permission to access this page
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Current Role:</strong> {user?.role || 'Unknown'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This page requires additional permissions that your current role doesn't provide.
              Please contact your administrator if you believe this is an error.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleGoBack}
              size="large"
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              onClick={handleGoHome}
              size="large"
            >
              Go to Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;