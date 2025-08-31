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
  Breadcrumbs,
  Link,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format, addMinutes, parseISO } from 'date-fns';
import ApiService from '../../services/api';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const preselectedPatientId = searchParams.get('patientId');

  const [formData, setFormData] = useState({
    patient_id: preselectedPatientId || '',
    service_id: '',
    appointment_date: null,
    appointment_time: null,
    duration: 30,
    status: 'scheduled',
    notes: '',
    dentist: '',
    appointment_type: 'checkup',
  });

  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [dentists] = useState([
    'Dr. Smith',
    'Dr. Johnson',
    'Dr. Williams',
    'Dr. Brown',
    'Dr. Davis',
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  const appointmentTypes = [
    'checkup',
    'cleaning',
    'consultation',
    'treatment',
    'emergency',
    'follow_up',
  ];

  const statusOptions = [
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
  ];

  useEffect(() => {
    loadInitialData();
    if (isEdit) {
      loadAppointment();
    }
  }, [id, isEdit]);

  const loadInitialData = async () => {
    try {
      const [patientsResponse, servicesResponse] = await Promise.all([
        ApiService.getPatients({ limit: 1000 }),
        ApiService.getServices({ limit: 1000 }),
      ]);

      if (patientsResponse.success) {
        setPatients(patientsResponse.data || []);
      }
      if (servicesResponse.success) {
        setServices(servicesResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setAlert({
        show: true,
        message: 'Failed to load form data. Please try again.',
        severity: 'error',
      });
    }
  };

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAppointment(id);
      if (response.success && response.data) {
        const appointment = response.data;
        setFormData({
          patient_id: appointment.patient_id || '',
          service_id: appointment.service_id || '',
          appointment_date: appointment.appointment_date ? parseISO(appointment.appointment_date) : null,
          appointment_time: appointment.appointment_time ? parseISO(`2000-01-01T${appointment.appointment_time}`) : null,
          duration: appointment.duration || 30,
          status: appointment.status || 'scheduled',
          notes: appointment.notes || '',
          dentist: appointment.dentist || '',
          appointment_type: appointment.appointment_type || 'checkup',
        });
      }
    } catch (error) {
      console.error('Failed to load appointment:', error);
      setAlert({
        show: true,
        message: 'Failed to load appointment data.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Patient is required';
    }
    if (!formData.service_id) {
      newErrors.service_id = 'Service is required';
    }
    if (!formData.appointment_date) {
      newErrors.appointment_date = 'Appointment date is required';
    }
    if (!formData.appointment_time) {
      newErrors.appointment_time = 'Appointment time is required';
    }
    if (!formData.dentist) {
      newErrors.dentist = 'Dentist is required';
    }
    if (formData.duration < 15 || formData.duration > 240) {
      newErrors.duration = 'Duration must be between 15 and 240 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert({
        show: true,
        message: 'Please fix the errors below.',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      
      const appointmentData = {
        patient_id: parseInt(formData.patient_id),
        service_id: parseInt(formData.service_id),
        appointment_date: format(formData.appointment_date, 'yyyy-MM-dd'),
        appointment_time: format(formData.appointment_time, 'HH:mm'),
        duration: parseInt(formData.duration),
        status: formData.status,
        notes: formData.notes,
        dentist: formData.dentist,
        appointment_type: formData.appointment_type,
      };

      let response;
      if (isEdit) {
        response = await ApiService.updateAppointment(id, appointmentData);
      } else {
        response = await ApiService.createAppointment(appointmentData);
      }

      if (response.success) {
        setAlert({
          show: true,
          message: `Appointment ${isEdit ? 'updated' : 'created'} successfully!`,
          severity: 'success',
        });
        
        setTimeout(() => {
          navigate('/appointments');
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to save appointment');
      }
    } catch (error) {
      console.error('Failed to save appointment:', error);
      setAlert({
        show: true,
        message: error.message || `Failed to ${isEdit ? 'update' : 'create'} appointment.`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/appointments');
  };

  const getSelectedPatient = () => {
    return patients.find(p => p.id === parseInt(formData.patient_id));
  };

  const getSelectedService = () => {
    return services.find(s => s.id === parseInt(formData.service_id));
  };

  const calculateEndTime = () => {
    if (formData.appointment_time && formData.duration) {
      const endTime = addMinutes(formData.appointment_time, formData.duration);
      return format(endTime, 'HH:mm');
    }
    return '';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/appointments')}
            sx={{ textDecoration: 'none' }}
          >
            Appointments
          </Link>
          <Typography color="text.primary">
            {isEdit ? 'Edit Appointment' : 'New Appointment'}
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/appointments')}
            variant="outlined"
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="primary" />
            <Typography variant="h4" component="h1">
              {isEdit ? 'Edit Appointment' : 'New Appointment'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 3 }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Patient Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={patients}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
                value={getSelectedPatient() || null}
                onChange={(event, newValue) => {
                  handleInputChange('patient_id', newValue ? newValue.id : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Patient"
                    required
                    error={!!errors.patient_id}
                    helperText={errors.patient_id}
                    placeholder="Search and select a patient"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option.first_name} {option.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email} • {option.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            {/* Service Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={services}
                getOptionLabel={(option) => `${option.name} - $${option.base_price}`}
                value={getSelectedService() || null}
                onChange={(event, newValue) => {
                  handleInputChange('service_id', newValue ? newValue.id : '');
                  if (newValue && newValue.duration) {
                    handleInputChange('duration', newValue.duration);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Service"
                    required
                    error={!!errors.service_id}
                    helperText={errors.service_id}
                    placeholder="Search and select a service"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.category} • ${option.base_price} • {option.duration}min
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            {/* Appointment Date */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Appointment Date"
                value={formData.appointment_date}
                onChange={(newValue) => handleInputChange('appointment_date', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    error={!!errors.appointment_date}
                    helperText={errors.appointment_date}
                  />
                )}
                minDate={new Date()}
              />
            </Grid>

            {/* Appointment Time */}
            <Grid item xs={12} md={6}>
              <TimePicker
                label="Appointment Time"
                value={formData.appointment_time}
                onChange={(newValue) => handleInputChange('appointment_time', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    error={!!errors.appointment_time}
                    helperText={errors.appointment_time || (calculateEndTime() && `Ends at: ${calculateEndTime()}`)}
                  />
                )}
                minutesStep={15}
              />
            </Grid>

            {/* Duration */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                required
                error={!!errors.duration}
                helperText={errors.duration || (calculateEndTime() && `Ends at: ${calculateEndTime()}`)}
                inputProps={{
                  min: 15,
                  max: 240,
                  step: 15
                }}
              />
            </Grid>

            {/* Dentist */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.dentist}>
                <InputLabel>Dentist</InputLabel>
                <Select
                  value={formData.dentist}
                  onChange={(e) => handleInputChange('dentist', e.target.value)}
                  label="Dentist"
                >
                  {dentists.map((dentist) => (
                    <MenuItem key={dentist} value={dentist}>
                      {dentist}
                    </MenuItem>
                  ))}
                </Select>
                {errors.dentist && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.dentist}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Appointment Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Appointment Type</InputLabel>
                <Select
                  value={formData.appointment_type}
                  onChange={(e) => handleInputChange('appointment_type', e.target.value)}
                  label="Appointment Type"
                >
                  {appointmentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or special instructions..."
              />
            </Grid>

            {/* Selected Patient & Service Summary */}
            {(getSelectedPatient() || getSelectedService()) && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Appointment Summary
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {getSelectedPatient() && (
                    <Chip
                      label={`Patient: ${getSelectedPatient().first_name} ${getSelectedPatient().last_name}`}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {getSelectedService() && (
                    <Chip
                      label={`Service: ${getSelectedService().name} ($${getSelectedService().base_price})`}
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  {formData.appointment_date && formData.appointment_time && (
                    <Chip
                      label={`${format(formData.appointment_date, 'MMM dd, yyyy')} at ${format(formData.appointment_time, 'HH:mm')}`}
                      color="info"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Appointment' : 'Create Appointment')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AppointmentForm;