import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ToothIcon from '../../components/Icons/ToothIcon';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);
      
      if (result.success) {
        // Call onLogin callback if provided
        if (onLogin) {
          onLogin(result.user);
        }
        
        // Navigate to dashboard (root path)
        navigate('/');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.message || 
        'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.username.trim() && formData.password.trim();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 50%, #2A5F8F 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Desktop Card */}
          <Card
            sx={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Logo and Title */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: '#4A90E2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 16px rgba(74, 144, 226, 0.3)'
                    }}
                  >
                    <ToothIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: '#2A5F8F',
                    mb: 1
                  }}
                >
                  SmileSync
                </Typography>
                <Typography 
                   variant="body1" 
                   sx={{ 
                     color: '#6B7280',
                     fontSize: '0.95rem'
                   }}
                 >
                   Dental Practice Management
                 </Typography>
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  placeholder="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#9CA3AF' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 3,
                      backgroundColor: '#F9FAFB',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #4A90E2'
                      }
                    }
                  }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  placeholder="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#9CA3AF' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 3,
                      backgroundColor: '#F9FAFB',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #4A90E2'
                      }
                    }
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={!isFormValid || loading}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    backgroundColor: '#4A90E2',
                    boxShadow: '0 8px 16px rgba(74, 144, 226, 0.3)',
                    '&:hover': {
                      backgroundColor: '#357ABD',
                      boxShadow: '0 12px 20px rgba(74, 144, 226, 0.4)'
                    },
                    '&:disabled': {
                      backgroundColor: '#9CA3AF'
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography 
                   variant="body2" 
                   sx={{ 
                     color: '#9CA3AF',
                     fontSize: '0.85rem'
                   }}
                 >
                   Welcome to SmileSync Dental Management System
                 </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;