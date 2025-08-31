import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  InputAdornment,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  MedicalServices as ServicesIcon
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import ApiService from '../../services/api';

const ServiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration_minutes: 60,
    base_price: '',
    is_active: true
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Predefined service categories
  const defaultCategories = [
    'Preventive',
    'Restorative', 
    'Endodontic',
    'Cosmetic',
    'Oral Surgery',
    'Orthodontic',
    'Periodontic',
    'Prosthodontic'
  ];

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadService();
    }
  }, [id, isEdit]);

  const loadCategories = async () => {
    try {
      const response = await ApiService.request('/services/categories');
      if (response.data.success) {
        // Combine existing categories with default ones
        const existingCategories = response.data.data || [];
        const allCategories = [...new Set([...defaultCategories, ...existingCategories])];
        setCategories(allCategories.sort());
      } else {
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(defaultCategories);
    }
  };

  const loadService = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getService(id);
      if (response.data.success) {
        const service = response.data.data;
        setFormData({
          name: service.name || '',
          description: service.description || '',
          category: service.category || '',
          duration_minutes: service.duration_minutes || 60,
          base_price: service.base_price || '',
          is_active: service.is_active !== undefined ? service.is_active : true
        });
      } else {
        setError('Failed to load service details');
      }
    } catch (error) {
      console.error('Error loading service:', error);
      setError('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validations
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Service name must be less than 200 characters';
    }
    
    if (!formData.category || !formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.trim().length > 100) {
      newErrors.category = 'Category must be less than 100 characters';
    }
    
    if (!formData.base_price) {
      newErrors.base_price = 'Base price is required';
    } else {
      const price = parseFloat(formData.base_price);
      if (isNaN(price) || price <= 0) {
        newErrors.base_price = 'Base price must be a positive number';
      } else if (price > 999999.99) {
        newErrors.base_price = 'Base price cannot exceed $999,999.99';
      }
    }
    
    if (!formData.duration_minutes) {
      newErrors.duration_minutes = 'Duration is required';
    } else {
      const duration = parseInt(formData.duration_minutes);
      if (isNaN(duration) || duration < 15) {
        newErrors.duration_minutes = 'Duration must be at least 15 minutes';
      } else if (duration > 480) {
        newErrors.duration_minutes = 'Duration cannot exceed 480 minutes (8 hours)';
      }
    }
    
    // Optional field validations
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    // Set all errors at once
    if (Object.keys(newErrors).length > 0) {
      setError('Please correct the errors in the form');
      // You might want to implement field-specific error display here
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const serviceData = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        duration_minutes: parseInt(formData.duration_minutes)
      };

      let response;
      if (isEdit) {
        response = await ApiService.updateService(id, serviceData);
      } else {
        response = await ApiService.createService(serviceData);
      }

      if (response.data.success) {
        setSuccess(isEdit ? 'Service updated successfully!' : 'Service created successfully!');
        setTimeout(() => {
          navigate('/services');
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      setError('Failed to save service. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/services');
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
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/services" color="inherit">
          Services
        </Link>
        <Typography color="text.primary">
          {isEdit ? 'Edit Service' : 'New Service'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ServicesIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          {isEdit ? 'Edit Service' : 'Create New Service'}
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Service Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Service Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="e.g., Dental Cleaning"
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Price */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => handleInputChange('base_price', e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  inputProps={{
                    min: 0,
                    step: 0.01
                  }}
                />
              </Grid>

              {/* Duration */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                  }}
                  inputProps={{
                    min: 1,
                    step: 1
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the service..."
                />
              </Grid>

              {/* Active Status */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Active Service"
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<CancelIcon />}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (isEdit ? 'Update Service' : 'Create Service')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ServiceForm;