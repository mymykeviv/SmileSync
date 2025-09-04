import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Box,
  Typography,
  Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import ApiService from '../../services/api';
import ErrorDisplay from '../../components/Common/ErrorDisplay';

const UserForm = ({ open, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'staff',
    phone: '',
    licenseNumber: '',
    specialization: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'assistant', label: 'Dental Assistant' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'staff', label: 'Staff' }
  ];

  useEffect(() => {
    if (open) {
      if (user) {
        // Editing existing user
        setFormData({
          username: user.username || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: user.role || 'staff',
          phone: user.phone || '',
          licenseNumber: user.licenseNumber || '',
          specialization: user.specialization || '',
          isActive: user.isActive !== undefined ? user.isActive : true
        });
      } else {
        // Adding new user
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          role: 'staff',
          phone: '',
          licenseNumber: '',
          specialization: '',
          isActive: true
        });
      }
      setErrors({});
      setSubmitError(null);
    }
  }, [open, user]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Password validation (only for new users or when password is provided)
    if (!user || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Phone validation (optional)
    if (formData.phone) {
      const phonePattern = /^(\+?1[-\s]?)?\(?[0-9]{3}\)?[-\s]?[0-9]{3}[-\s]?[0-9]{4}$|^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
      if (!phonePattern.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const submitData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        phone: formData.phone.trim() || null,
        licenseNumber: formData.licenseNumber.trim() || null,
        specialization: formData.specialization.trim() || null,
        isActive: formData.isActive
      };

      // Include password only if provided
      if (formData.password) {
        submitData.password = formData.password;
      }

      let response;
      if (user) {
        // Update existing user
        response = await ApiService.updateUser(user.id, submitData);
      } else {
        // Create new user
        response = await ApiService.createUser(submitData);
      }

      if (response.success) {
        onSave();
      } else {
        setSubmitError({
          code: response.errorCode || 'UNKNOWN_ERROR',
          message: response.message || 'Failed to save user',
          details: response.details || null
        });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setSubmitError({
        code: error.statusCode ? 'API_ERROR' : 'NETWORK_ERROR',
        message: error.message || 'Failed to save user',
        details: error.originalError || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
    >
      <DialogTitle>
        {user ? 'Edit Staff Member' : 'Add New Staff Member'}
      </DialogTitle>
      
      <DialogContent>
        {submitError && (
          <ErrorDisplay
            error={submitError}
            onRetry={() => handleSubmit({ preventDefault: () => {} })}
            onClose={() => setSubmitError(null)}
            sx={{ mb: 2 }}
          />
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={handleChange('username')}
              error={!!errors.username}
              helperText={errors.username}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>

          {/* Role and Contact */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Role & Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Role"
              value={formData.role}
              onChange={handleChange('role')}
              error={!!errors.role}
              helperText={errors.role}
              required
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="+1 (555) 123-4567"
            />
          </Grid>

          {/* Professional Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Professional Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="License Number"
              value={formData.licenseNumber}
              onChange={handleChange('licenseNumber')}
              error={!!errors.licenseNumber}
              helperText={errors.licenseNumber || 'For licensed professionals only'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Specialization"
              value={formData.specialization}
              onChange={handleChange('specialization')}
              error={!!errors.specialization}
              helperText={errors.specialization || 'e.g., Orthodontics, Oral Surgery'}
            />
          </Grid>

          {/* Password Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {user ? 'Change Password (Optional)' : 'Password'}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {user && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Leave password fields empty to keep current password
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              required={!user}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              required={!user || !!formData.password}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleChange('isActive')}
                  color="primary"
                />
              }
              label="Active User"
            />
            <Typography variant="body2" color="text.secondary">
              Inactive users cannot log in to the system
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          loadingPosition="start"
        >
          {user ? 'Update User' : 'Create User'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;