import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import { Save as SaveIcon, Settings as SettingsIcon } from '@mui/icons-material';
import api from '../../services/api';

const SystemSettings = () => {
  const [config, setConfig] = useState({
    clinicName: '',
    clinicSubtitle: '',
    contactPhone: '',
    clinicAddress: '',
    practiceName: '',
    email: '',
    website: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clinic/config');
      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching clinic config:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load clinic configuration. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!config.clinicName.trim()) {
      newErrors.clinicName = 'Clinic name is required';
    }
    
    if (!config.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    }
    
    if (!config.clinicAddress.trim()) {
      newErrors.clinicAddress = 'Clinic address is required';
    }
    
    if (!config.practiceName.trim()) {
      newErrors.practiceName = 'Practice name is required';
    }
    
    if (config.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Please fix the errors below before saving.'
      });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const response = await api.put('/clinic/config', config);
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Clinic configuration updated successfully!'
        });
        
        // Update the config with the response data
        setConfig(response.data.data);
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 5000);
      }
    } catch (error) {
      console.error('Error updating clinic config:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update clinic configuration. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            System Settings
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Configure your clinic details that will appear in the application header and invoice PDFs.
        </Typography>
      </Paper>

      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Clinic Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This information will be displayed in your application header and included in invoice PDFs.
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Clinic Name"
                value={config.clinicName}
                onChange={handleInputChange('clinicName')}
                error={!!errors.clinicName}
                helperText={errors.clinicName || 'This will replace "Dental Practice Management" in the header'}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Practice Name"
                value={config.practiceName}
                onChange={handleInputChange('practiceName')}
                error={!!errors.practiceName}
                helperText={errors.practiceName || 'e.g., "Dr. Smith\'s Practice"'}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Clinic Subtitle"
                value={config.clinicSubtitle}
                onChange={handleInputChange('clinicSubtitle')}
                helperText="Subtitle that appears below the clinic name"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={config.contactPhone}
                onChange={handleInputChange('contactPhone')}
                error={!!errors.contactPhone}
                helperText={errors.contactPhone || 'e.g., "(555) 123-SMILE"'}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={config.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email || 'Clinic contact email address'}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Clinic Address"
                value={config.clinicAddress}
                onChange={handleInputChange('clinicAddress')}
                error={!!errors.clinicAddress}
                helperText={errors.clinicAddress || 'Full clinic address'}
                required
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={config.website}
                onChange={handleInputChange('website')}
                helperText="Clinic website URL (optional)"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Logo URL"
                value={config.logoUrl}
                onChange={handleInputChange('logoUrl')}
                helperText="URL to clinic logo image (optional)"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemSettings;