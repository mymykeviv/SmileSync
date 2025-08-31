import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Typography,
  Box
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import ApiService from '../../services/api';

const PasswordChangeDialog = ({ open, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (open) {
      setFormData({
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [open]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
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

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await ApiService.updateUserPassword(user.id, {
        newPassword: formData.newPassword
      });

      if (response.success) {
        onSave();
      } else {
        throw new Error(response.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setSubmitError(error.message || 'Failed to update password');
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
    >
      <DialogTitle>
        Change Password
      </DialogTitle>
      
      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        {user && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              Changing password for: <strong>{user.firstName} {user.lastName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Username: {user.username}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          type="password"
          label="New Password"
          value={formData.newPassword}
          onChange={handleChange('newPassword')}
          error={!!errors.newPassword}
          helperText={errors.newPassword || 'Must be at least 8 characters with uppercase, lowercase, and number'}
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          type="password"
          label="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          required
        />
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
          Update Password
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChangeDialog;