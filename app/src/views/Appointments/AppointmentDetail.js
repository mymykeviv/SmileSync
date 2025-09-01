import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PersonAdd as PersonIcon,
  Schedule as ScheduleIcon,
  MedicalServices as MedicalServicesIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import ApiService from '../../services/api';

function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusDialog, setStatusDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAppointment(id);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error loading appointment:', error);
      setError('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no_show':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'no_show':
        return 'No Show';
      default:
        return status;
    }
  };



  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await ApiService.updateAppointmentStatus(id, newStatus);
      await loadAppointment();
      setStatusDialog(false);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Use the error message from the API if available, otherwise use a generic message
      const errorMessage = error.message || 'Failed to update appointment status';
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    try {
      setUpdating(true);
      await ApiService.cancelAppointment(id, cancelReason);
      await loadAppointment();
      setCancelDialog(false);
      setCancelReason('');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      // Use the error message from the API if available, otherwise use a generic message
      const errorMessage = error.message || 'Failed to cancel appointment';
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/appointments')}
        >
          Back to Appointments
        </Button>
      </Box>
    );
  }

  if (!appointment) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Appointment not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/appointments')}
        >
          Back to Appointments
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/appointments')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Appointment Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/appointments/${id}/edit`)}
          >
            Edit
          </Button>
          {appointment.status === 'scheduled' && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleStatusChange('in_progress')}
                disabled={updating}
              >
                Start Appointment
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusChange('completed')}
                disabled={updating}
              >
                Mark as Completed
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setCancelDialog(true)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => handleStatusChange('no_show')}
                disabled={updating}
              >
                Mark as No Show
              </Button>
            </>
          )}
          {appointment.status === 'in_progress' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusChange('completed')}
                disabled={updating}
              >
                Mark as Completed
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setCancelDialog(true)}
                disabled={updating}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Appointment Card */}
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ScheduleIcon color="primary" />
                <Typography variant="h6">Appointment Information</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Appointment Number</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {appointment.appointmentNumber}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {appointment.formattedDatetime}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Duration</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {appointment.durationMinutes} minutes
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={getStatusLabel(appointment.status)}
                  color={getStatusColor(appointment.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              
              {appointment.appointmentType && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {appointment.appointmentType}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Patient Information */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Patient Information</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Patient Name</Typography>
                <Typography 
                  variant="body1" 
                  fontWeight="medium"
                  sx={{ cursor: 'pointer', color: 'primary.main' }}
                  onClick={() => navigate(`/patients/${appointment.patientId}`)}
                >
                  {appointment.patientName}
                </Typography>
              </Box>
              
              {appointment.patientNumber && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Patient Number</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {appointment.patientNumber}
                  </Typography>
                </Box>
              )}
              
              {appointment.dentistName && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Dentist</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {appointment.dentistName}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Clinical Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MedicalServicesIcon color="primary" />
                <Typography variant="h6">Clinical Information</Typography>
              </Box>
              
              {appointment.chiefComplaint && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Chief Complaint</Typography>
                  <Typography variant="body1">
                    {appointment.chiefComplaint}
                  </Typography>
                </Box>
              )}
              
              {appointment.treatmentNotes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Treatment Notes</Typography>
                  <Typography variant="body1">
                    {appointment.treatmentNotes}
                  </Typography>
                </Box>
              )}
              
              {appointment.nextAppointmentRecommended && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Next Appointment</Typography>
                  <Typography variant="body1">
                    Recommended
                    {appointment.nextAppointmentNotes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {appointment.nextAppointmentNotes}
                      </Typography>
                    )}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>



      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for cancelling this appointment.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason for cancellation..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCancel} 
            color="error" 
            variant="contained"
            disabled={updating || !cancelReason.trim()}
          >
            {updating ? <CircularProgress size={20} /> : 'Cancel Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AppointmentDetail;