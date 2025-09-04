import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  InputAdornment,
  Fab,
  Avatar,
  CardActions,
  Divider,
  Stack,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonIcon,
  AccessTime as AccessTimeIcon,
  MedicalServices as MedicalServicesIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import ApiService from '../../services/api';

function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const formatAppointmentDate = (date) => {
    if (!date) return 'Invalid Date';
    try {
      // Handle both timestamp and ISO string formats
      if (typeof date === 'number') {
        return format(new Date(date), 'MMM dd, yyyy');
      } else if (typeof date === 'string') {
        // Try parsing as ISO string first
        if (date.includes('T') || date.includes('-')) {
          return format(parseISO(date), 'MMM dd, yyyy');
        } else {
          // Try parsing as timestamp string
          return format(new Date(parseInt(date)), 'MMM dd, yyyy');
        }
      }
      return 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return 'Invalid Date';
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // Format the date parameter exactly like the Dashboard does
      const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        date: dateStr,  // Use the formatted date string
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      console.log('Fetching appointments with params:', params);
      const response = await ApiService.getAppointments(params);
      console.log('Appointments response:', response);
      if (response.success) {
        // Check if response.data is an array (direct appointments) or has a nested data structure
        if (Array.isArray(response.data)) {
          setAppointments(response.data);
          console.log('Setting appointments from response.data array:', response.data);
          // If pagination data is in the response object
          if (response.pagination) {
            console.log('Setting pagination from response.pagination:', response.pagination);
          }
        } else if (response.data && Array.isArray(response.data.appointments)) {
          // If appointments are in a nested structure
          setAppointments(response.data.appointments);
          console.log('Setting appointments from response.data.appointments:', response.data.appointments);
          // If pagination data is in the response.data object
          if (response.data.pagination) {
            console.log('Setting pagination from response.data.pagination:', response.data.pagination);
          }
        } else {
          console.error('Unexpected response format:', response);
          setAppointments([]);
        }
        
        // Set pagination data if available
        if (response.pagination) {
          // Handle pagination if the API returns it
          console.log('Pagination data:', response.pagination);
        }
      } else {
        console.error('Failed to load appointments:', response.message);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    
    // Set up an interval to refresh appointments every 30 seconds
    const refreshInterval = setInterval(() => {
      loadAppointments();
    }, 30000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(refreshInterval);
  }, [page, rowsPerPage, searchTerm, selectedDate, statusFilter]);

  const handleMenuOpen = (event, appointment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleRefresh = () => {
    loadAppointments();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleEdit = () => {
    navigate(`/appointments/${selectedAppointment.id}/edit`);
    handleMenuClose();
  };

  const handleCancel = () => {
    setCancelDialog(true);
    // Don't close menu yet - keep selectedAppointment for cancel confirmation
  };

  const handleComplete = async () => {
    try {
      await ApiService.completeAppointment(selectedAppointment.id, 'Completed from appointments list');
      loadAppointments();
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
    handleMenuClose();
  };

  const handleCancelDialogClose = () => {
    setCancelDialog(false);
    setCancelReason('');
    handleMenuClose();
  };

  const handleCancelConfirm = async () => {
    try {
      await ApiService.cancelAppointment(selectedAppointment.id, cancelReason);
      setCancelDialog(false);
      setCancelReason('');
      handleMenuClose(); // Close menu after successful cancellation
      loadAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
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

  // Note: Date and status filtering is already handled by the API in loadAppointments
  // Only apply client-side search filtering here to avoid double filtering
  const filteredAppointments = appointments.filter(appointment => {
    // First check if the appointment object has the required properties
    if (!appointment || typeof appointment !== 'object') {
      console.warn('Invalid appointment object:', appointment);
      return false;
    }

    // Safely check properties with optional chaining
    const patientName = appointment.patientName || 
      `${appointment.patient_first_name || ''} ${appointment.patient_last_name || ''}`.trim();
    const appointmentNumber = appointment.appointmentNumber || appointment.appointment_number || '';
    const service = appointment.service || appointment.service_name || '';
    
    const matchesSearch = !searchTerm || 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Appointments
        </Typography>
        <Box>
          <IconButton onClick={loadAppointments} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appointments/new')}
            sx={{ ml: 1 }}
          >
            New Appointment
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Filter by Date"
                value={selectedDate}
                onChange={setSelectedDate}
                slots={{
                  textField: TextField
                }}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="no_show">No Show</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDate(null);
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {filteredAppointments
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((appointment, index) => (
              <Box key={appointment.id}>
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/appointments/${appointment.id}`)}
                >
                  {/* Left Section - Patient & Appointment Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 3, width: 48, height: 48 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          #{appointment.appointmentNumber}
                        </Typography>
                        <Chip
                          label={getStatusLabel(appointment.status)}
                          color={getStatusColor(appointment.status)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 0.5
                        }}
                      >
                        {appointment.patientName || 'Unknown Patient'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.appointmentType || 'General Consultation'} • 
                        {appointment.dentistName ? `Dr. ${appointment.dentistName}` : 'No doctor assigned'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Center Section - Date & Time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200, mr: 3 }}>
                    <AccessTimeIcon sx={{ color: 'text.secondary', mr: 1.5, fontSize: 20 }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatAppointmentDate(appointment.appointmentDate)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.appointmentTime} • {appointment.durationMinutes || 60} min
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right Section - Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, appointment);
                      }}
                      size="small"
                      sx={{ 
                        bgcolor: 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' }
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
                {index < filteredAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length - 1 && (
                  <Divider />
                )}
              </Box>
            ))
          }
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredAppointments.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredAppointments.length / rowsPerPage)}
            page={page + 1}
            onChange={(e, newPage) => setPage(newPage - 1)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Empty State */}
      {filteredAppointments.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 3 }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No appointments found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || statusFilter !== 'all' || selectedDate 
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by scheduling your first appointment.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appointments/new')}
          >
            Schedule Appointment
          </Button>
        </Paper>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        {selectedAppointment?.status === 'scheduled' && (
          <MenuItem onClick={handleComplete}>
            <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
            Mark Complete
          </MenuItem>
        )}
        {selectedAppointment?.status !== 'cancelled' && selectedAppointment?.status !== 'completed' && (
          <MenuItem onClick={handleCancel}>
            <CancelIcon sx={{ mr: 1 }} fontSize="small" />
            Cancel
          </MenuItem>
        )}
      </Menu>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onClose={handleCancelDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to cancel this appointment?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCancelConfirm} 
            variant="contained" 
            color="error"
            disabled={!cancelReason.trim()}
          >
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add appointment"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/appointments/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default Appointments;