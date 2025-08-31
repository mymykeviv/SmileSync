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
  Alert,
  Divider,
  Paper,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import ApiService from '../../services/api';

function PatientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceGroupNumber: '',
    medicalHistory: '',
    medications: '',
    allergies: '',
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      loadPatient();
    }
  }, [id]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getPatient(id);
      if (response.success) {
        setFormData(response.data);
      } else {
        setError('Failed to load patient data');
      }
    } catch (error) {
      setError('Failed to load patient data');
      console.error('Error loading patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (basic)
    if (formData.phone && !/^[\d\s\-\(\)\+]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Date validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      setError('Please correct the errors below');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      const response = isEditing 
        ? await ApiService.updatePatient(id, formData)
        : await ApiService.createPatient(formData);
      
      if (response.success) {
        setSuccess(isEditing ? 'Patient updated successfully!' : 'Patient created successfully!');
        setTimeout(() => {
          navigate('/patients');
        }, 1500);
      } else {
        setError(response.error || 'Failed to save patient');
      }
    } catch (error) {
      setError('Failed to save patient');
      console.error('Error saving patient:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Loading patient data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/patients')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Edit Patient' : 'New Patient'}
          </Typography>
        </Box>
        
        <Breadcrumbs>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/patients')}
            sx={{ textDecoration: 'none' }}
          >
            Patients
          </Link>
          <Typography color="text.primary">
            {isEditing ? `Edit ${formData.firstName} ${formData.lastName}` : 'New Patient'}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon />
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange('firstName')}
                      error={Boolean(errors.firstName)}
                      helperText={errors.firstName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange('lastName')}
                      error={Boolean(errors.lastName)}
                      helperText={errors.lastName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      error={Boolean(errors.email)}
                      helperText={errors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      error={Boolean(errors.phone)}
                      helperText={errors.phone}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange('dateOfBirth')}
                      error={Boolean(errors.dateOfBirth)}
                      helperText={errors.dateOfBirth}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={formData.gender}
                        onChange={handleInputChange('gender')}
                        label="Gender"
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                        <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Address Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={formData.address}
                      onChange={handleInputChange('address')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.city}
                      onChange={handleInputChange('city')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="State"
                      value={formData.state}
                      onChange={handleInputChange('state')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={formData.zipCode}
                      onChange={handleInputChange('zipCode')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Emergency Contact */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Emergency Contact
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Name"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange('emergencyContactName')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Phone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange('emergencyContactPhone')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Relationship</InputLabel>
                      <Select
                        value={formData.emergencyContactRelation}
                        onChange={handleInputChange('emergencyContactRelation')}
                        label="Relationship"
                      >
                        <MenuItem value="spouse">Spouse</MenuItem>
                        <MenuItem value="parent">Parent</MenuItem>
                        <MenuItem value="child">Child</MenuItem>
                        <MenuItem value="sibling">Sibling</MenuItem>
                        <MenuItem value="friend">Friend</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Insurance Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Insurance Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Insurance Provider"
                      value={formData.insuranceProvider}
                      onChange={handleInputChange('insuranceProvider')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Policy Number"
                      value={formData.insurancePolicyNumber}
                      onChange={handleInputChange('insurancePolicyNumber')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Group Number"
                      value={formData.insuranceGroupNumber}
                      onChange={handleInputChange('insuranceGroupNumber')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Medical Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Medical Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Medical History"
                      multiline
                      rows={3}
                      value={formData.medicalHistory}
                      onChange={handleInputChange('medicalHistory')}
                      placeholder="Previous dental work, surgeries, chronic conditions, etc."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Current Medications"
                      multiline
                      rows={2}
                      value={formData.medications}
                      onChange={handleInputChange('medications')}
                      placeholder="List current medications and dosages"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Allergies"
                      multiline
                      rows={2}
                      value={formData.allergies}
                      onChange={handleInputChange('allergies')}
                      placeholder="Known allergies to medications, materials, etc."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {saving ? 'Saving...' : (isEditing ? 'Update Patient' : 'Create Patient')}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default PatientForm;